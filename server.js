const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const connectDB = require('./backend/config/db');

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

// Initialize app
const app = express();
const PORT = process.env.PORT || 5001;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // disabled for inline styles/scripts in frontend
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting — prevent brute-force attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // max 20 login/register attempts per 15 min
  message: { message: 'Too many attempts, please try again after 15 minutes' },
});

// General API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});

// Middleware
app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// API Routes
app.use('/api/auth', authLimiter, require('./backend/routes/authRoutes'));
app.use('/api/products', apiLimiter, require('./backend/routes/productRoutes'));
app.use('/api/orders', apiLimiter, require('./backend/routes/orderRoutes'));
app.use('/api/payment', apiLimiter, require('./backend/routes/paymentRoutes'));

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
