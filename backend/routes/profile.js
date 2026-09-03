const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Farmer = require('../models/Farmer');

const fs = require('fs');

// Configure multer storage in memory
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

// Upload profile image as File/URL
router.post('/upload/:id', upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided.' });
        }

        const farmer = await Farmer.findById(req.params.id);
        if (!farmer) return res.status(404).json({ error: 'Farmer not found.' });

        const uploadDir = path.join(__dirname, '../uploads/profiles');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        let ext = path.extname(req.file.originalname).toLowerCase();
        if (!ext || ext === '.') ext = '.jpg';
        const filename = `profile_${farmer.id}_${Date.now()}${ext}`;
        const filePath = path.join(uploadDir, filename);

        // Write image binary buffer to file on disk
        fs.writeFileSync(filePath, req.file.buffer);
        const fileUrl = `/uploads/profiles/${filename}`;

        // Save URL string reference to database
        await Farmer.updateProfileImage(req.params.id, fileUrl);

        res.json({
            success: true,
            profileImage: fileUrl,
            message: 'Profile image uploaded successfully!'
        });
    } catch (error) {
        console.error('Profile Upload Error:', error.message);
        res.status(500).json({ error: 'Failed to upload image: ' + error.message });
    }
});

// Get profile image info
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
