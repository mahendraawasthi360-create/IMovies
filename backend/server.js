'use strict';

require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes    = require('./routes/auth');
const movieRoutes   = require('./routes/movies');
const showRoutes    = require('./routes/shows');
const bookingRoutes = require('./routes/bookings');
const adminRoutes   = require('./routes/admin');
const theatreRoutes = require('./routes/theatres');

// Connect to MongoDB (non-blocking — server stays alive even if DB is down)
connectDB();

// Express App
const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Health check — always responds, even without DB
app.get('/api/health', (_req, res) => {
  const mongoose = require('mongoose');
  const dbState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    success: true,
    message: 'IMovies API is running',
    db: dbState[mongoose.connection.readyState] || 'unknown',
  });
});

// API Routes
app.use('/api/auth',     authRoutes);
app.use('/api/movies',   movieRoutes);
app.use('/api/shows',    showRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/theatres', theatreRoutes);

// 404
app.use((_req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Global error handler
app.use(errorHandler);

// HTTP Server + Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);
  socket.on('join:show',  (showId) => showId && socket.join(showId));
  socket.on('leave:show', (showId) => showId && socket.leave(showId));
  socket.on('disconnect', () => console.log(`[Socket.IO] Client disconnected: ${socket.id}`));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`[Server] IMovies API running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

module.exports = { io };
