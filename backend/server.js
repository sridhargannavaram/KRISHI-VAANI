require('dotenv').config();
const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initDb, pool } = require('./config/db');

// Environment startup validation
if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ FATAL: JWT_SECRET environment variable is required in production.');
    process.exit(1);
  } else {
    console.warn('⚠️ WARNING: JWT_SECRET is not set in environment.');
  }
}

const app = express();
const PORT = process.env.PORT || 4000;

// Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com", "https://unpkg.com", "https://cdn.jsdelivr.net", "https://www.gstatic.com"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com", "https://unpkg.com", "https://cdn.jsdelivr.net"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
      connectSrc: ["'self'", "https:", "http:", "ws:", "wss:"],
      workerSrc: ["'self'"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: null
    }
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Authentication Rate Limiter (Protects against excessive bot flooding without inconveniencing human users)
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute sliding window
  max: 60, // Up to 60 attempts per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many rapid requests from this network. Please wait a moment and try again.'
  }
});

// Deep CORS policies
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:4000',
  'http://localhost:8080',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
  /^https:\/\/.*\.netlify\.app$/,
  /^https:\/\/.*\.vercel\.app$/
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }

    let isAllowed = false;
    for (let i = 0; i < allowedOrigins.length; i++) {
        if (allowedOrigins[i] instanceof RegExp) {
            if (allowedOrigins[i].test(origin)) {
                isAllowed = true;
                break;
            }
        } else if (allowedOrigins[i] === origin) {
            isAllowed = true;
            break;
        }
    }
    if (isAllowed) {
        return callback(null, true);
    } else {
        if (process.env.NODE_ENV === 'production') {
            return callback(new Error('CORS blocked for this origin by Krishi Vaani security policy.'));
        } else {
            return callback(null, true); // Allow during development
        }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting to auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/send-otp', authLimiter);
app.use('/api/auth/verify-otp', authLimiter);
app.use('/api/auth/admin/login', authLimiter);

// Initialize Supabase PostgreSQL Schema & Connection
initDb()
  .then(async () => {
    console.log('✅ Supabase PostgreSQL Connected & Ready');
    try {
      const { backfillMarketCoordinates } = require('./services/geocodingService');
      await backfillMarketCoordinates();
    } catch (e) {
      console.warn('Coordinates backfill note:', e.message);
    }
  })
  .catch((err) => console.error('❌ Supabase PostgreSQL Init Warning:', err.message));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/api-status', (req, res) => {
  res.json({
    status: 'online',
    database: 'Supabase PostgreSQL',
    server: 'KRISHI VAANI Backend API',
    timestamp: new Date().toISOString()
  });
});

// Routes
const authRoutes = require('./routes/auth');
const weatherRoutes = require('./routes/weather');
const aiRoutes = require('./routes/ai');
const newsRoutes = require('./routes/news');
const farmerRoutes = require('./routes/farmer');
const cropAlertRoutes = require('./routes/cropAlerts');
const profileRoutes = require('./routes/profile');
const mandiRoutes = require('./routes/mandi');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');

app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/ai-advisory', aiRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/crop-alerts', cropAlertRoutes);
app.use('/alerts', cropAlertRoutes);
app.use('/api/alerts', cropAlertRoutes);
app.use('/api/profile', profileRoutes);
app.use('/profile', profileRoutes);
app.use('/api/farmer/profile', profileRoutes);
app.use('/api/market-prices', mandiRoutes);
app.use('/api/mandi', mandiRoutes);
app.use('/api/marketplace', mandiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Initialize AlertGuard Cron Job
require('./scheduler/alertGuard');

// HTTPS Setup (using self-signed certificates for development)
const httpsOptions = {
  key: fs.existsSync(path.join(__dirname, 'server.key')) ? fs.readFileSync(path.join(__dirname, 'server.key')) : '',
  cert: fs.existsSync(path.join(__dirname, 'server.cert')) ? fs.readFileSync(path.join(__dirname, 'server.cert')) : ''
};

// Only start the server locally if not running in a Serverless environment like Vercel
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  if (httpsOptions.key && httpsOptions.cert) {
    https.createServer(httpsOptions, app).listen(PORT, () => {
      console.log(`🚀 HTTPS Server running on port ${PORT}`);
    });
  } else {
    console.log('⚠️ No SSL certificates found in backend/. Running HTTP server instead.');
    app.listen(PORT, () => {
      console.log(`🚀 HTTP Server running on port ${PORT}`);
    });
  }
}

// Export the Express API for Serverless environments (like Vercel)
module.exports = app;
