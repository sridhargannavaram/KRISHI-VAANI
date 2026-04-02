require('dotenv').config();
const express = require('express');
const https = require('https');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 4000;

// Deep CORS policies
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8080',
  /^https:\/\/.*\.netlify\.app$/,
  /^https:\/\/.*\.vercel\.app$/
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
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
        return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection (Singleton pattern for Serverless)
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  if (!process.env.MONGODB_URI) {
    console.log('⚠️ MONGODB_URI not found.');
    return null;
  }
  
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected Successfully');
    cachedDb = db;
    return db;
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    throw err;
  }
}

// Initial connection attempt
connectToDatabase();

app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed: ' + err.message });
  }
});

// Basic route for testing
app.get('/', (req, res) => {
  res.send('KRISHI VAANI Backend API is running!');
});

// Routes
const authRoutes = require('./routes/auth');
const weatherRoutes = require('./routes/weather');
const aiRoutes = require('./routes/ai');
const newsRoutes = require('./routes/news');
const farmerRoutes = require('./routes/farmer');
const cropAlertRoutes = require('./routes/cropAlerts');
const profileRoutes = require('./routes/profile');

app.use('/api/auth', authRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/ai-advisory', aiRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/crop-alerts', cropAlertRoutes);
app.use('/api/profile', profileRoutes);

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
