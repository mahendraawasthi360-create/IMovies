'use strict';

const express = require('express');
const router  = express.Router();
const { getAllBookings, getDashboardStats } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/bookings',   protect, adminOnly, getAllBookings);
router.get('/dashboard',  protect, adminOnly, getDashboardStats);

module.exports = router;
