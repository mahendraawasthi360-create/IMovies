'use strict';

const { body } = require('express-validator');

// ── Register ──────────────────────────────────────────────────────────────────
const registerUser = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[0-9]{7,15}$/).withMessage('Please provide a valid phone number'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// ── Login ─────────────────────────────────────────────────────────────────────
const loginUser = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

// ── Create Movie ──────────────────────────────────────────────────────────────
const createMovie = [
  body('title')
    .trim()
    .notEmpty().withMessage('Title is required'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required'),

  body('duration')
    .notEmpty().withMessage('Duration is required')
    .isInt({ min: 1 }).withMessage('Duration must be a positive integer (minutes)'),

  body('certificate')
    .optional()
    .isIn(['U', 'UA', 'A', 'S']).withMessage('Certificate must be U, UA, A, or S'),

  body('rating')
    .optional()
    .isFloat({ min: 0, max: 10 }).withMessage('Rating must be between 0 and 10'),

  body('status')
    .optional()
    .isIn(['now_showing', 'coming_soon', 'ended']).withMessage('Invalid status value'),
];

// ── Create Show ───────────────────────────────────────────────────────────────
const createShow = [
  body('movieId')
    .notEmpty().withMessage('Movie ID is required')
    .isMongoId().withMessage('Invalid movie ID'),

  body('theatreId')
    .notEmpty().withMessage('Theatre ID is required')
    .isMongoId().withMessage('Invalid theatre ID'),

  body('screenId')
    .notEmpty().withMessage('Screen ID is required'),

  body('startTime')
    .notEmpty().withMessage('Start time is required')
    .isISO8601().withMessage('Start time must be a valid ISO 8601 date'),

  body('endTime')
    .notEmpty().withMessage('End time is required')
    .isISO8601().withMessage('End time must be a valid ISO 8601 date'),
];

// ── Create Booking ────────────────────────────────────────────────────────────
const createBooking = [
  body('showId')
    .notEmpty().withMessage('Show ID is required')
    .isMongoId().withMessage('Invalid show ID'),

  body('seats')
    .isArray({ min: 1 }).withMessage('At least one seat must be selected'),

  body('seats.*.seatId')
    .notEmpty().withMessage('Each seat must have a seatId'),
];

module.exports = { registerUser, loginUser, createMovie, createShow, createBooking };
