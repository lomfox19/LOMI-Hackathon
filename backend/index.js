const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
dotenv.config();
const app = express();
// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err);
    process.exit(1);
  });
// AUTH ROUTES (SVH Authentication)
const authRoutes = require('./auth/routes');
app.use('/auth', authRoutes);
// FEATURE ROUTES (Modular / Plug-and-Play)
const profileRoutes = require('./routes/profileRoutes');
const aiRoutes = require('./routes/aiRoutes');
const medicalRoutes = require('./routes/medicalRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
// All feature routes are mounted under /api to keep a clean namespace.
// New modules can be added by creating a route file and adding one line here.
app.use('/api', profileRoutes);
app.use('/api', aiRoutes);
app.use('/api', medicalRoutes);
app.use('/api', feedbackRoutes);
// Health Check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Server is running',
    auth: 'SVH Authentication Active'
  });
});
// Error Handling
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});
// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔐 Auth: http://localhost:${PORT}/auth`);
});