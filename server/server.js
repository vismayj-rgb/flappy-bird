/**
 * Main Server Entry Point
 * Flappy Bird Game API Server
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const achievementRoutes = require('./routes/achievement.routes');
const socialRoutes = require('./routes/social.routes');
const sessionRoutes = require('./routes/session.routes');
const challengeRoutes = require('./routes/challenge.routes');
const storeRoutes = require('./routes/store.routes');
const powerupRoutes = require('./routes/powerup.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const settingsRoutes = require('./routes/settings.routes');
const notificationRoutes = require('./routes/notification.routes');
const tournamentRoutes = require('./routes/tournament.routes');

// Import middleware
const errorHandler = require('./middleware/error.middleware');
const rateLimiter = require('./middleware/rate-limiter.middleware');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(compression()); // Compress responses
app.use(morgan('combined')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(rateLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/scores', leaderboardRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/social', socialRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/powerups', powerupRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/tournaments', tournamentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Flappy Bird API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
