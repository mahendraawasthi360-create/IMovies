'use strict';

const { validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Show    = require('../models/Show');
const User    = require('../models/User');
const { generateBookingCode } = require('../utils/bookingCode');
const { generateQRCode }      = require('../utils/qrCodeGenerator');
const { sendBookingConfirmation } = require('../utils/emailService');

const getIO = () => require('../server').io;

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/bookings  (protect)
 * Body: { showId, seats: [{ seatId }] }
 */
const createBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
    }

    const { showId, seats: requestedSeats } = req.body;
    const userId = req.user.id;
    const now = new Date();

    // Fetch the show
    const show = await Show.findById(showId).populate('movieId', 'title').populate('theatreId', 'name city');
    if (!show) return res.status(404).json({ success: false, message: 'Show not found.' });

    const seatIds = requestedSeats.map((s) => s.seatId);

    // Verify all requested seats are held by this user and not expired
    const showSeats = show.seats.filter((s) => seatIds.includes(s.seatId));
    if (showSeats.length !== seatIds.length) {
      return res.status(400).json({ success: false, message: 'One or more seats do not exist in this show.' });
    }

    for (const seat of showSeats) {
      if (seat.status !== 'held') {
        return res.status(409).json({ success: false, message: `Seat ${seat.seatId} is not held. Please hold seats first.` });
      }
      if (!seat.heldBy || seat.heldBy.toString() !== userId) {
        return res.status(403).json({ success: false, message: `Seat ${seat.seatId} is not held by you.` });
      }
      if (!seat.holdExpiresAt || seat.holdExpiresAt <= now) {
        return res.status(409).json({ success: false, message: `Hold on seat ${seat.seatId} has expired. Please try again.` });
      }
    }

    // Atomically mark seats as booked
    const bookedSeatData = [];
    let totalAmount = 0;

    for (const seat of show.seats) {
      if (seatIds.includes(seat.seatId)) {
        const price = show.priceTiers[seat.category] || 0;
        seat.status = 'booked';
        seat.heldBy = null;
        seat.holdExpiresAt = null;
        bookedSeatData.push({ seatId: seat.seatId, category: seat.category, price });
        totalAmount += price;
      }
    }
    await show.save();

    // Generate booking code (with retry for uniqueness)
    let bookingCode;
    let attempts = 0;
    do {
      bookingCode = generateBookingCode();
      attempts++;
      // eslint-disable-next-line no-await-in-loop
      const exists = await Booking.findOne({ bookingCode });
      if (!exists) break;
    } while (attempts < 10);

    // Generate QR code
    const qrPayload = {
      bookingCode,
      showId: show._id.toString(),
      userId,
      seats: seatIds,
    };
    const qrCode = await generateQRCode(qrPayload);

    // Create booking document
    const booking = await Booking.create({
      userId,
      showId,
      seats: bookedSeatData,
      totalAmount,
      status: 'confirmed',
      bookingCode,
      qrCode,
    });

    // Emit live seat update
    try {
      getIO().to(showId).emit('seats:updated', show.seats);
    } catch (_) { /* ignore */ }

    // Send confirmation email asynchronously (don't block response)
    const user = await User.findById(userId).select('email name');
    if (user && user.email) {
      sendBookingConfirmation(user.email, {
        bookingCode,
        movieTitle:  show.movieId?.title || 'Movie',
        showTime:    show.startTime,
        theatreName: show.theatreId?.name || 'Theatre',
        seats:       bookedSeatData,
        totalAmount,
        qrCode,
      }).catch((emailErr) => {
        console.error('[Email] Failed to send confirmation:', emailErr.message);
      });
    }

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/bookings/me  (protect)
 */
const getMyBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Booking.countDocuments({ userId: req.user.id });

    const bookings = await Booking.find({ userId: req.user.id })
      .populate({
        path: 'showId',
        populate: [
          { path: 'movieId',   select: 'title posterUrl duration' },
          { path: 'theatreId', select: 'name city' },
        ],
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: bookings,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/bookings/:id  (protect)
 */
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate({
      path: 'showId',
      populate: [
        { path: 'movieId',   select: 'title posterUrl duration language certificate' },
        { path: 'theatreId', select: 'name city address' },
      ],
    });

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    // Users can only view their own bookings (admins can view all)
    if (req.user.role !== 'admin' && booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/bookings/:id/cancel  (protect)
 */
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    if (booking.userId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only cancel your own bookings.' });
    }
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ success: false, message: `Cannot cancel a booking with status '${booking.status}'.` });
    }

    // Check show is at least 2 hours away
    const show = await Show.findById(booking.showId);
    if (!show) return res.status(404).json({ success: false, message: 'Associated show not found.' });

    const cutOff = new Date(show.startTime.getTime() - 2 * 60 * 60 * 1000);
    if (new Date() >= cutOff) {
      return res.status(400).json({
        success: false,
        message: 'Cancellation is not allowed within 2 hours of the show.',
      });
    }

    // Update booking status
    booking.status = 'cancelled';
    await booking.save();

    // Release seats back to available
    const cancelledSeatIds = booking.seats.map((s) => s.seatId);
    for (const seat of show.seats) {
      if (cancelledSeatIds.includes(seat.seatId) && seat.status === 'booked') {
        seat.status = 'available';
        seat.heldBy = null;
        seat.holdExpiresAt = null;
      }
    }
    await show.save();

    // Emit live update
    try {
      getIO().to(booking.showId.toString()).emit('seats:updated', show.seats);
    } catch (_) { /* ignore */ }

    res.json({ success: true, message: 'Booking cancelled successfully.', data: booking });
  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking, getMyBookings, getBookingById, cancelBooking };
