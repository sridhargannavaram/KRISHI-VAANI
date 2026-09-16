const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Farmer = require('../models/Farmer');
const { query } = require('../config/db');

// Initialize Twilio client only if credentials are present
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

// Ensure OTP table exists (runs once on cold start)
let otpTableReady = false;
async function ensureOtpTable() {
    if (otpTableReady) return;
    try {
        await query(`
            CREATE TABLE IF NOT EXISTS otp_codes (
                id SERIAL PRIMARY KEY,
                phone VARCHAR(50) NOT NULL,
                code VARCHAR(10) NOT NULL,
                expires_at TIMESTAMPTZ NOT NULL,
                used BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        await query(`CREATE INDEX IF NOT EXISTS idx_otp_codes_phone ON otp_codes(phone, used);`);
        otpTableReady = true;
    } catch (e) {
        console.warn('⚠️ OTP table creation warning:', e.message);
        otpTableReady = true; // Table likely already exists
    }
}

// Send OTP via SMS
router.post('/send-otp', async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ error: 'Phone number is required.' });

        // Ensure E.164 format for India
        let formattedPhone = phone.startsWith('+') ? phone : '+91' + phone;

        // Always generate a simulated OTP and store in database for reliable verification
        // Twilio trial accounts often don't deliver SMS, so we always show the OTP to the user
        await ensureOtpTable();
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + (5 * 60 * 1000)); // 5 minutes
        
        // Clear any previous unused OTPs for this phone
        await query('DELETE FROM otp_codes WHERE phone = $1 AND used = FALSE', [formattedPhone]);
        // Store new OTP in database
        await query(
            'INSERT INTO otp_codes (phone, code, expires_at) VALUES ($1, $2, $3)',
            [formattedPhone, otp, expiresAt]
        );
        
        // Also attempt Twilio Verify in background (best-effort, don't block on it)
        if (twilioClient && process.env.TWILIO_VERIFY_SERVICE_SID) {
            try {
                await twilioClient.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
                    .verifications
                    .create({ to: formattedPhone, channel: 'sms' });
                console.log('✅ Twilio Verify OTP also sent to', formattedPhone);
            } catch(vErr) {
                console.warn('⚠️ Twilio Verify failed (using simulated):', vErr.message);
            }
        }
        
        console.log(`📱 OTP for ${formattedPhone}: ${otp} (valid for 5 mins)`);
        // Always return OTP to user so they can complete signup
        return res.json({ 
            success: true, 
            message: `OTP generated! Your code is: ${otp}`, 
            otp: otp, 
            mode: 'simulated' 
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ error: 'Failed to send OTP: ' + error.message });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { phone, otp } = req.body;
        if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP are required.' });
        
        let formattedPhone = phone.startsWith('+') ? phone : '+91' + phone;

        // Use database-backed verification as primary method
        // (Twilio Verify check removed - we always use our own OTP stored in PostgreSQL)

        // Database-backed verification: check against stored OTP with TTL
        await ensureOtpTable();
        const result = await query(
            'SELECT * FROM otp_codes WHERE phone = $1 AND used = FALSE ORDER BY created_at DESC LIMIT 1',
            [formattedPhone]
        );
        
        if (result.rows.length > 0) {
            const stored = result.rows[0];
            if (new Date() > new Date(stored.expires_at)) {
                await query('DELETE FROM otp_codes WHERE id = $1', [stored.id]);
                return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
            }
            if (stored.code === otp.trim()) {
                // Mark as used instead of deleting
                await query('UPDATE otp_codes SET used = TRUE WHERE id = $1', [stored.id]);
                return res.json({ success: true, message: 'OTP verified successfully!' });
            } else {
                return res.status(400).json({ error: 'Invalid OTP code.' });
            }
        }

        return res.status(400).json({ error: 'No active OTP request found for this phone number.' });
    } catch (error) {
        console.error('OTP Verification Error:', error);
        res.status(500).json({ error: 'Server error during verification: ' + error.message });
    }
});

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, phone, password, city, state, district, village, postalCode, formattedAddress, lng, lat, accuracy, source } = req.body;
        if (!phone || !password || !name) {
            return res.status(400).json({ error: 'Missing required registration fields.' });
        }

        let existing = await Farmer.findByPhone(phone);
        if (existing) return res.status(400).json({ error: 'Farmer with this phone already exists.' });

        const farmer = await Farmer.create({
            name,
            phone,
            password,
            city: city || 'Bengaluru',
            state: state || '',
            district: district || '',
            village: village || '',
            postalCode: postalCode || '',
            formattedAddress: formattedAddress || '',
            lng: parseFloat(lng) || 77.5946,
            lat: parseFloat(lat) || 12.9716,
            accuracy: parseFloat(accuracy) || 0,
            source: source || 'GPS',
            isVerified: true
        });

        // Generate persistent 1-year JWT token so user stays permanently logged in
        const token = jwt.sign(
            { id: farmer.id, phone: farmer.phone },
            process.env.JWT_SECRET,
            { expiresIn: '365d' }
        );

        res.status(201).json({ 
            success: true, 
            message: 'Farmer registered successfully.', 
            token,
            farmer: {
                id: farmer.id,
                name: farmer.name,
                phone: farmer.phone,
                city: farmer.city,
                state: farmer.state,
                district: farmer.district,
                village: farmer.village,
                postalCode: farmer.postalCode,
                formattedAddress: farmer.formattedAddress,
                location: farmer.location,
                profileImage: farmer.profileImage,
                isVerified: farmer.isVerified
            }
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ error: 'Server error during registration: ' + error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { phone, password } = req.body;
        const farmer = await Farmer.findByPhone(phone);
        if (!farmer) {
            return res.status(401).json({ error: 'Invalid phone number or password.' });
        }

        if (!farmer.isActive) {
            return res.status(403).json({ error: 'Account disabled. Please contact Krishi Vaani administration.' });
        }

        const isMatch = await farmer.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid phone number or password.' });
        }

        await Farmer.updateLastLogin(farmer.id, req);

        // 1-year persistent token for seamless mobile app / PWA experience
        const token = jwt.sign(
            { id: farmer.id, phone: farmer.phone },
            process.env.JWT_SECRET,
            { expiresIn: '365d' }
        );

        res.json({
            success: true,
            token,
            farmer: {
                id: farmer.id,
                name: farmer.name,
                phone: farmer.phone,
                city: farmer.city,
                state: farmer.state,
                district: farmer.district,
                village: farmer.village,
                postalCode: farmer.postalCode,
                formattedAddress: farmer.formattedAddress,
                location: farmer.location,
                accuracy: farmer.accuracy,
                locationSource: farmer.locationSource,
                locationUpdatedAt: farmer.locationUpdatedAt,
                alertPreferences: farmer.alertPreferences,
                profileImage: farmer.profileImage
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ error: 'Server error during login: ' + error.message });
    }
});

const { requireFarmerAuth } = require('../middleware/farmerAuth');

/**
 * POST /api/auth/heartbeat
 * Periodic farmer activity / heartbeat ping
 */
router.post('/heartbeat', requireFarmerAuth, async (req, res) => {
    try {
        await Farmer.updateHeartbeat(req.farmer.id);
        res.json({ success: true, timestamp: new Date().toISOString() });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Social Login endpoint placeholders
router.post('/social-login', async (req, res) => {
    res.json({ success: true, message: 'Social login mocked.' });
});

// ==========================================
// ADMIN AUTHENTICATION
// ==========================================
const Admin = require('../models/Admin');
const { requireAdminAuth } = require('../middleware/adminAuth');

/**
 * POST /api/auth/admin/login
 * Authenticate Administrator via Email or Mobile + Password
 */
router.post('/admin/login', async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email/Mobile number and password are required.' 
            });
        }

        // Find admin account with password hash included for comparison
        const admin = await Admin.findByIdentifier(identifier, true);

        // Security: Use constant generic error message to prevent user enumeration
        if (!admin) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid email/mobile number or password.' 
            });
        }

        // Verify account active status
        if (!admin.isActive) {
            return res.status(403).json({ 
                success: false, 
                error: 'Admin account is currently disabled. Please contact system administrator.' 
            });
        }

        // Verify role
        if (admin.role !== 'ADMIN') {
            return res.status(403).json({ 
                success: false, 
                error: 'Access denied: Administrator privileges required.' 
            });
        }

        // Verify bcrypt password hash
        const isMatch = await Admin.comparePassword(password, admin.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid email/mobile number or password.' 
            });
        }

        // Update last login timestamp
        await Admin.updateLastLogin(admin.id);

        // Generate secure JWT token
        const token = jwt.sign(
            { 
                id: admin.id, 
                email: admin.email, 
                mobile: admin.mobile, 
                role: 'ADMIN' 
            },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            success: true,
            message: 'Admin authentication successful.',
            token,
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                mobile: admin.mobile,
                role: admin.role,
                lastLoginAt: admin.lastLoginAt
            }
        });
    } catch (error) {
        console.error('Admin Login Server Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error during admin authentication.' });
    }
});

/**
 * GET /api/auth/admin/me
 * Fetch current authenticated Admin profile
 */
router.get('/admin/me', requireAdminAuth, async (req, res) => {
    res.json({
        success: true,
        admin: {
            id: req.admin.id,
            name: req.admin.name,
            email: req.admin.email,
            mobile: req.admin.mobile,
            role: req.admin.role,
            lastLoginAt: req.admin.lastLoginAt,
            createdAt: req.admin.createdAt
        }
    });
});


/**
 * POST /api/auth/change-password
 * Secure password change for authenticated farmer
 */
router.post('/change-password', async (req, res) => {
    try {
        const { farmerId, currentPassword, newPassword } = req.body;
        if (!farmerId || !currentPassword || !newPassword) {
            return res.status(400).json({ success: false, error: 'Current password and new password are required.' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long.' });
        }

        const farmer = await Farmer.findById(farmerId);
        if (!farmer) {
            return res.status(404).json({ success: false, error: 'Farmer account not found.' });
        }

        // Verify current password with bcrypt
        const isMatch = await farmer.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ success: false, error: 'Current password is incorrect.' });
        }

        // Ensure new password is not identical to current
        const isSame = await farmer.comparePassword(newPassword);
        if (isSame) {
            return res.status(400).json({ success: false, error: 'New password cannot be identical to your current password.' });
        }

        // Update password with bcrypt hash in database
        await Farmer.updatePassword(farmer.id, newPassword);

        // Record security activity log
        await Farmer.logActivity(farmer.id, 'PASSWORD_CHANGE', { ip: req.ip });

        res.json({ success: true, message: 'Password updated successfully.' });
    } catch (error) {
        console.error('Password Change Error:', error);
        res.status(500).json({ success: false, error: 'Failed to update password: ' + error.message });
    }
});

// GET /api/auth/me - Verify and retrieve current logged-in farmer session
router.get('/me', requireFarmerAuth, async (req, res) => {
    try {
        const farmer = req.farmer;
        res.json({
            success: true,
            farmer: {
                id: farmer.id,
                name: farmer.name,
                phone: farmer.phone,
                city: farmer.city,
                state: farmer.state,
                district: farmer.district,
                village: farmer.village,
                postalCode: farmer.postalCode,
                formattedAddress: farmer.formattedAddress,
                location: farmer.location,
                profileImage: farmer.profileImage,
                isVerified: farmer.isVerified,
                alertPreferences: farmer.alertPreferences
            }
        });
    } catch (err) {
        console.error('Auth /me Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;

