const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Farmer = require('../models/Farmer');

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/profiles'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `profile_${req.params.id}_${Date.now()}${ext}`);
    }
});

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

// Upload profile image
router.post('/upload/:id', upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided.' });
        }

        const farmer = await Farmer.findById(req.params.id);
        if (!farmer) return res.status(404).json({ error: 'Farmer not found.' });

        farmer.profileImage = req.file.filename;
        await farmer.save();

        res.json({
            success: true,
            profileImage: req.file.filename,
            message: 'Profile image uploaded successfully!'
        });
    } catch (error) {
        console.error('Profile Upload Error:', error.message);
        res.status(500).json({ error: 'Failed to upload image.' });
    }
});

// Get profile image info
router.get('/:id', async (req, res) => {
    try {
        const farmer = await Farmer.findById(req.params.id).select('name phone city profileImage');
        if (!farmer) return res.status(404).json({ error: 'Farmer not found.' });
        res.json(farmer);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile.' });
    }
});

module.exports = router;
