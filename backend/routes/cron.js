const express = require('express');
const router = express.Router();
const { runAlertGuardCheck } = require('../scheduler/alertGuard');

/**
 * GET /api/cron/alerts
 * Triggered automatically by Vercel Cron or manually by admin/webhook
 */
router.get('/alerts', async (req, res) => {
    // Check authorization: Vercel Cron header or optional CRON_SECRET or query secret
    const isVercelCron = req.headers['x-vercel-cron'] || (req.headers['user-agent'] && req.headers['user-agent'].includes('vercel-cron'));
    const secret = req.query.secret || req.headers['x-cron-secret'];
    const authHeader = req.headers['authorization'];

    if (process.env.CRON_SECRET) {
        const bearerSecret = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
        const providedSecret = secret || bearerSecret;
        if (!isVercelCron && providedSecret !== process.env.CRON_SECRET) {
            return res.status(401).json({ error: 'Unauthorized: Invalid cron secret' });
        }
    }

    try {
        console.log('⏰ /api/cron/alerts invoked (isVercelCron:', !!isVercelCron, ')');
        const stats = await runAlertGuardCheck();
        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            source: isVercelCron ? 'vercel-cron' : 'manual-trigger',
            stats
        });
    } catch (err) {
        console.error('Error in /api/cron/alerts:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to complete AlertGuard check',
            message: err.message
        });
    }
});

// Also support POST for manual testing
router.post('/alerts', async (req, res) => {
    try {
        const stats = await runAlertGuardCheck();
        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            stats
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
});

module.exports = router;
