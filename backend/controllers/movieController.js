'use strict';

const { validationResult } = require('express-validator');
const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const Show  = require('../models/Show');
const { isConnected } = require('../config/db');

// Helper: validate MongoDB ObjectId format
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id) && /^[a-f\d]{24}$/i.test(id);

// Helper: return 503 when DB is not available
const dbUnavailable = (res) =>
  res.status(503).json({ success: false, message: 'Database not available. Please try again shortly.' });

/**
 * GET /api/movies
 * Query params: genre, language, status, search, page, limit
 */
const getAllMovies = async (req, res, next) => {
  if (!isConnected()) return dbUnavailable(res);
  try {
    const { genre, language, status, search, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (genre)    filter.genres   = { $in: [genre] };
    if (language) filter.language = language;
    if (status)   filter.status   = status;
    if (search)   filter.title    = { $regex: search, $options: 'i' };

    const skip   = (parseInt(page) - 1) * parseInt(limit);
    const total  = await Movie.countDocuments(filter);
    const movies = await Movie.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: movies,
      pagination: {
        total,
        page:  parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/movies/:id
 */
const getMovieById = async (req, res, next) => {
  // Reject non-ObjectId values immediately (e.g. mock IDs like "movie_01")
  if (!isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Movie not found.' });
  }
  if (!isConnected()) return dbUnavailable(res);
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found.' });

    res.json({ success: true, data: movie });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/movies/:id/shows
 */
const getMovieShows = async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Movie not found.' });
  }
  if (!isConnected()) return dbUnavailable(res);
  try {
    const { date } = req.query;
    const filter = { movieId: req.params.id };

    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end   = new Date(date); end.setHours(23, 59, 59, 999);
      filter.startTime = { $gte: start, $lte: end };
    } else {
      filter.startTime = { $gte: new Date() };
    }

    const shows = await Show.find(filter)
      .populate('theatreId', 'name city address')
      .sort({ startTime: 1 });

    res.json({ success: true, data: shows });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/movies  (admin)
 */
const createMovie = async (req, res, next) => {
  if (!isConnected()) return dbUnavailable(res);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
    }
    const movie = await Movie.create(req.body);
    res.status(201).json({ success: true, data: movie });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/movies/:id  (admin)
 */
const updateMovie = async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) return res.status(404).json({ success: false, message: 'Movie not found.' });
  if (!isConnected()) return dbUnavailable(res);
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found.' });
    res.json({ success: true, data: movie });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/movies/:id  (admin)
 */
const deleteMovie = async (req, res, next) => {
  if (!isValidObjectId(req.params.id)) return res.status(404).json({ success: false, message: 'Movie not found.' });
  if (!isConnected()) return dbUnavailable(res);
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found.' });
    res.json({ success: true, message: 'Movie deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllMovies, getMovieById, getMovieShows, createMovie, updateMovie, deleteMovie };
