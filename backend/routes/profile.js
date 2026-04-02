const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Farmer = require('../models/Farmer');

// Configure multer storage in memory (Vercel has read-only filesystem)
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max for Base64 efficiency
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

// Upload profile image as Base64 string
router.post('/upload/:id', upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided.' });
        }

        const farmer = await Farmer.findById(req.params.id);
        if (!farmer) return res.status(404).json({ error: 'Farmer not found.' });

        // Convert buffer to Base64 data URI
        const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        
        farmer.profileImage = base64Image;
        await farmer.save();

        res.json({
            success: true,
            profileImage: base64Image,
            message: 'Profile image uploaded successfully (saved to DB)!'
        });
    } catch (error) {
        console.error('Profile Upload Error:', error.message);
        res.status(500).json({ error: 'Failed to upload image: ' + error.message });
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
