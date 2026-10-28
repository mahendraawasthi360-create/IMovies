'use strict';

const express = require('express');
const router  = express.Router();
const {
  getShowById, getSeatMap, holdSeats, releaseSeats, createShow, updateShow, cancelShow,
} = require('../controllers/showController');
const { protect, adminOnly } = require('../middleware/auth');
const { createShow: validateCreateShow } = require('../middleware/validate');

// IMPORTANT: specific static paths must come before /:id
router.post('/',            protect, adminOnly, validateCreateShow, createShow);
router.get('/:id',          getShowById);
router.get('/:id/seats',    getSeatMap);
router.post('/:id/hold',    protect, holdSeats);
router.post('/:id/release', protect, releaseSeats);
router.put('/:id',          protect, adminOnly, updateShow);
router.delete('/:id',       protect, adminOnly, cancelShow);

module.exports = router;
