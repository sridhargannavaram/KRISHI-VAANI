const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const farmerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  alertPreferences: {
    temperatureThreshold: {
      type: Number,
      default: 35 // Custom temperature threshold in °C
    },
    humidityThreshold: {
      type: Number,
      default: 80 // Custom humidity threshold in %
    },
    windSpeedThreshold: {
      type: Number,
      default: 15 // Custom wind speed in m/s
    },
    rainAlert: {
      type: Boolean,
      default: true
    },
    windAlert: {
      type: Boolean,
      default: true
    }
  },
  profileImage: {
    type: String,
    default: ''
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for geospatial queries
farmerSchema.index({ location: '2dsphere' });

// Hash password before saving
farmerSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password
farmerSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Farmer', farmerSchema);
