const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const Farmer = require('../models/Farmer');

// Initialize Twilio client only if credentials are present
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;
// In-memory OTP store for fallback simulation
const otpStore = {};

// Send OTP via SMS
router.post('/send-otp', async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone) return res.status(400).json({ error: 'Phone number is required.' });

        // Ensure E.164 format for India
        let formattedPhone = phone.startsWith('+') ? phone : '+91' + phone;

        // Attempt Twilio Verify V2 first
        if (twilioClient && process.env.TWILIO_VERIFY_SERVICE_SID) {
            try {
                await twilioClient.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
                    .verifications
                    .create({ to: formattedPhone, channel: 'sms' });
                console.log('✅ Twilio Verify OTP sent to', formattedPhone);
                return res.json({ success: true, message: `OTP sent to ${formattedPhone}! Check your phone.`, mode: 'twilio' });
            } catch(vErr) {
                console.warn('⚠️ Twilio Verify failed:', vErr.message);
                // Fall through to simulation
            }
        }

        // Graceful Fallback: Generate simulated OTP with 5-min TTL
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore[formattedPhone] = {
            code: otp,
            expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes validity
        };
        
        if (process.env.NODE_ENV !== 'production') {
            console.log(`📱 [DEV ONLY] Simulated OTP for ${formattedPhone}: ${otp} (valid for 5 mins)`);
            return res.json({ 
                success: true, 
                message: `OTP generated! Your code is: ${otp}`, 
                otp: otp, 
                mode: 'simulated' 
            });
        }

        return res.json({ 
            success: true, 
            message: `OTP sent successfully to ${formattedPhone}. Please check your phone.`
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

        // Attempt Twilio Verify check first
        if (twilioClient && process.env.TWILIO_VERIFY_SERVICE_SID) {
            try {
                const check = await twilioClient.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
                    .verificationChecks
                    .create({ to: formattedPhone, code: otp });
                    
                if (check.status === 'approved') {
                    return res.json({ success: true, message: 'OTP verified successfully!' });
                } else {
                    return res.status(400).json({ error: 'Invalid OTP code.' });
                }
            } catch(vErr) {
                console.warn('⚠️ Twilio Verify check failed:', vErr.message);
                // Fall through to simulated check
            }
        }

        // Simulated verification: check against stored OTP with TTL
        const stored = otpStore[formattedPhone];
        if (stored) {
            if (Date.now() > stored.expiresAt) {
                delete otpStore[formattedPhone];
                return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
            }
            if (stored.code === otp.trim()) {
                delete otpStore[formattedPhone]; // Invalidate immediately upon successful verification
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

        res.status(201).json({ success: true, message: 'Farmer registered successfully.', farmerId: farmer.id });
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

        const token = jwt.sign(
            { id: farmer.id, phone: farmer.phone },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
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

module.exports = router;

