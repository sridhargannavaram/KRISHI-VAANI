const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Farmer = require('../models/Farmer');

// Configure multer storage in memory (Zero local disk writes, 100% Vercel compatible)
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: (req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files (JPG, PNG, WEBP, GIF) are allowed.'));
        }
    }
});

/**
 * 1. Stream/serve avatar image directly with HTTP caching
 * GET /api/profile/avatar/:id
 */
router.get('/avatar/:id', async (req, res) => {
    try {
        const raw = await Farmer.getAvatarRawData(req.params.id);
        if (!raw) {
            return res.status(404).send('Avatar not found');
        }

        const rawData = (raw.profile_image_backup || raw.profile_image || '').trim();
        if (!rawData || !rawData.startsWith('data:image/')) {
            // Default clean SVG Avatar placeholder if no custom image
            const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
                <circle cx="50" cy="50" r="50" fill="#16a34a"/>
                <circle cx="50" cy="38" r="18" fill="#ffffff"/>
                <path d="M 20 85 C 20 65, 80 65, 80 85 Z" fill="#ffffff"/>
            </svg>`;
            res.set({
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'
            });
            return res.send(defaultSvg);
        }

        const matches = rawData.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
        if (!matches || matches.length < 3) {
            return res.status(400).send('Corrupted avatar data');
        }

        let mimeType = `image/${matches[1].toLowerCase()}`;
        if (mimeType === 'image/jpg') mimeType = 'image/jpeg';
        const imageBuffer = Buffer.from(matches[2], 'base64');

        res.set({
            'Content-Type': mimeType,
            'Content-Length': imageBuffer.length,
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
            'ETag': `W/"avatar-${req.params.id}-${imageBuffer.length}"`
        });

        res.end(imageBuffer);
    } catch (error) {
        console.error('Avatar Stream Error:', error.message);
        res.status(500).send('Error retrieving avatar');
    }
});

/**
 * 2. Upload profile image directly to Database (Zero local disk writes, 100% Vercel compatible)
 * POST /api/profile/upload/:id
 */
router.post('/upload/:id', upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided.' });
        }

        const farmer = await Farmer.findById(req.params.id);
        if (!farmer) return res.status(404).json({ error: 'Farmer not found.' });

        // Convert buffer directly to Base64 data URI (In-memory only)
        const mimeType = req.file.mimetype || 'image/jpeg';
        const base64Data = `data:${mimeType};base64,${req.file.buffer.toString('base64')}`;

        // Save into PostgreSQL database and set clean URL to /api/profile/avatar/:id
        await Farmer.saveAvatar(req.params.id, base64Data);

        const avatarUrl = `/api/profile/avatar/${req.params.id}`;

        res.json({
            success: true,
            profileImage: avatarUrl,
            message: 'Profile image uploaded successfully!'
        });
    } catch (error) {
        console.error('Profile Upload Error:', error.message);
        res.status(500).json({ error: 'Failed to upload image: ' + error.message });
    }
});

/**
 * 3. Get profile image & user info
 * GET /api/profile/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const farmer = await Farmer.findById(req.params.id);
        if (!farmer) return res.status(404).json({ error: 'Farmer not found.' });
        res.json({
            name: farmer.name,
            phone: farmer.phone,
            city: farmer.city,
            profileImage: farmer.profileImage
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile.' });
    }
});

module.exports = router;
