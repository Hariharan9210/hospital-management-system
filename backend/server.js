const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const billingRoutes = require('./routes/billingRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// ============================================
// CORS - Allow both local and production URLs
// ============================================
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// ROUTES
// ============================================
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/billing', billingRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    message: '🏥 Hospital Management System API is running!',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// KEEP RENDER ALIVE (prevents free tier sleep)
// ============================================
if (process.env.NODE_ENV === 'production') {
  const https = require('https');
  setInterval(() => {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) return;
    https.get(`${backendUrl}/api/health`, (res) => {
      console.log(`Keep alive ping: ${res.statusCode}`);
    }).on('error', (err) => {
      console.log('Keep alive ping error:', err.message);
    });
  }, 14 * 60 * 1000);
}

app.use(errorHandler);

// ============================================
// DATABASE + SERVER START
// ============================================
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB Connected!');

    // Auto seed database if empty
    const seedDatabase = require('./utils/seedData');
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📋 Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1);
  });

module.exports = app;