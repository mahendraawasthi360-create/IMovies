'use strict';

const Theatre = require('../models/Theatre');

/**
 * GET /api/theatres
 */
const getAllTheatres = async (req, res, next) => {
  try {
    const { city } = req.query;
    const filter = {};
    if (city) filter.city = { $regex: city, $options: 'i' };

    const theatres = await Theatre.find(filter).sort({ city: 1, name: 1 });
    res.json({ success: true, data: theatres });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/theatres/:id
 */
const getTheatreById = async (req, res, next) => {
  try {
    const theatre = await Theatre.findById(req.params.id);
    if (!theatre) return res.status(404).json({ success: false, message: 'Theatre not found.' });
    res.json({ success: true, data: theatre });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/theatres  (admin)
 */
const createTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.create(req.body);
    res.status(201).json({ success: true, data: theatre });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/theatres/:id  (admin)
 */
const updateTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!theatre) return res.status(404).json({ success: false, message: 'Theatre not found.' });
    res.json({ success: true, data: theatre });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/theatres/:id  (admin)
 */
const deleteTheatre = async (req, res, next) => {
  try {
    const theatre = await Theatre.findByIdAndDelete(req.params.id);
    if (!theatre) return res.status(404).json({ success: false, message: 'Theatre not found.' });
    res.json({ success: true, message: 'Theatre deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllTheatres, getTheatreById, createTheatre, updateTheatre, deleteTheatre };
