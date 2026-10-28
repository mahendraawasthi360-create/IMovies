'use strict';

const express = require('express');
const router  = express.Router();
const {
  getAllMovies, getMovieById, getMovieShows,
  createMovie, updateMovie, deleteMovie,
} = require('../controllers/movieController');
const { protect, adminOnly } = require('../middleware/auth');
const { createMovie: validateCreateMovie } = require('../middleware/validate');

router.get('/',             getAllMovies);
router.get('/:id',          getMovieById);
router.get('/:id/shows',    getMovieShows);
router.post('/',            protect, adminOnly, validateCreateMovie, createMovie);
router.put('/:id',          protect, adminOnly, updateMovie);
router.delete('/:id',       protect, adminOnly, deleteMovie);

module.exports = router;
