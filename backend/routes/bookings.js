'use strict';

const express = require('express');
const router  = express.Router();
const { createBooking, getMyBookings, getBookingById, cancelBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');
const { createBooking: validateCreateBooking } = require('../middleware/validate');

router.post('/',              protect, validateCreateBooking, createBooking);
router.get('/me',             protect, getMyBookings);
router.get('/:id',            protect, getBookingById);
router.patch('/:id/cancel',   protect, cancelBooking);

module.exports = router;
