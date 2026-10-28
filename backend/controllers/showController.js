'use strict';

const { validationResult } = require('express-validator');
const Show    = require('../models/Show');
const Theatre = require('../models/Theatre');
const Movie   = require('../models/Movie');

// Lazy-load io to avoid circular dependency issues at startup
const getIO = () => require('../server').io;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Auto-release seats whose hold has expired */
const releaseExpiredHolds = async (show) => {
  const now = new Date();
  let modified = false;
  for (const seat of show.seats) {
    if (seat.status === 'held' && seat.holdExpiresAt && seat.holdExpiresAt <= now) {
      seat.status = 'available';
      seat.heldBy = null;
      seat.holdExpiresAt = null;
      modified = true;
    }
  }
  if (modified) await show.save();
  return show;
};

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * GET /api/shows/:id
 */
const getShowById = async (req, res, next) => {
  try {
    let show = await Show.findById(req.params.id)
      .populate('movieId', 'title posterUrl duration certificate language')
      .populate('theatreId', 'name city address');

    if (!show) return res.status(404).json({ success: false, message: 'Show not found.' });

    show = await releaseExpiredHolds(show);

    const totalSeats     = show.seats.length;
    const availableSeats = show.seats.filter((s) => s.status === 'available').length;
    const bookedSeats    = show.seats.filter((s) => s.status === 'booked').length;
    const heldSeats      = show.seats.filter((s) => s.status === 'held').length;

    res.json({
      success: true,
      data: {
        ...show.toObject(),
        seatStats: { totalSeats, availableSeats, bookedSeats, heldSeats },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/shows/:id/seats
 */
const getSeatMap = async (req, res, next) => {
  try {
    let show = await Show.findById(req.params.id).select('seats priceTiers');
    if (!show) return res.status(404).json({ success: false, message: 'Show not found.' });

    show = await releaseExpiredHolds(show);

    res.json({ success: true, data: show.seats });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/shows/:id/hold  (protect)
 * Body: { seatIds: ['A1', 'A2', ...] }
 */
const holdSeats = async (req, res, next) => {
  try {
    const { seatIds } = req.body;
    if (!Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ success: false, message: 'seatIds array is required.' });
    }

    const now            = new Date();
    const holdExpiresAt  = new Date(now.getTime() + 5 * 60 * 1000); // +5 minutes
    const userId         = req.user.id;

    // Use findOneAndUpdate with arrayFilters for an atomic conditional update
    // Only update seats that are currently 'available'
    const updated = await Show.findOneAndUpdate(
      {
        _id: req.params.id,
        // Ensure all requested seats exist and are available
        seats: {
          $not: {
            $elemMatch: {
              seatId: { $in: seatIds },
              status: { $ne: 'available' },
            },
          },
        },
      },
      {
        $set: {
          'seats.$[seat].status':         'held',
          'seats.$[seat].heldBy':         userId,
          'seats.$[seat].holdExpiresAt':  holdExpiresAt,
        },
      },
      {
        arrayFilters: [{ 'seat.seatId': { $in: seatIds } }],
        new: true,
        select: 'seats',
      }
    );

    if (!updated) {
      // Either show doesn't exist or one/more seats weren't available
      const show = await Show.findById(req.params.id).select('seats');
      if (!show) return res.status(404).json({ success: false, message: 'Show not found.' });

      const conflicting = show.seats
        .filter((s) => seatIds.includes(s.seatId) && s.status !== 'available')
        .map((s) => s.seatId);
      return res.status(409).json({
        success: false,
        message: 'One or more seats are no longer available.',
        conflicting,
      });
    }

    // Emit live update to show room
    try {
      getIO().to(req.params.id).emit('seats:updated', updated.seats);
    } catch (_) { /* io may not be available in test */ }

    const heldSeats = updated.seats.filter((s) => seatIds.includes(s.seatId));
    res.json({ success: true, data: heldSeats, holdExpiresAt });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/shows/:id/release  (protect)
 * Body: { seatIds: ['A1', 'A2', ...] }  — optional; if omitted, releases all user's holds
 */
const releaseSeats = async (req, res, next) => {
  try {
    const { seatIds } = req.body;
    const userId = req.user.id;

    const show = await Show.findById(req.params.id);
    if (!show) return res.status(404).json({ success: false, message: 'Show not found.' });

    let modified = false;
    for (const seat of show.seats) {
      const shouldRelease =
        seat.status === 'held' &&
        seat.heldBy &&
        seat.heldBy.toString() === userId &&
        (!seatIds || seatIds.includes(seat.seatId));

      if (shouldRelease) {
        seat.status = 'available';
        seat.heldBy = null;
        seat.holdExpiresAt = null;
        modified = true;
      }
    }

    if (modified) {
      await show.save();
      try {
        getIO().to(req.params.id).emit('seats:updated', show.seats);
      } catch (_) { /* io may not be available in test */ }
    }

    res.json({ success: true, message: 'Seats released successfully.' });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/shows  (admin)
 * Builds the seat array from the theatre's screen layout.
 */
const createShow = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
    }

    const { movieId, theatreId, screenId, startTime, endTime, priceTiers } = req.body;

    // Validate movie
    const movie = await Movie.findById(movieId);
    if (!movie) return res.status(404).json({ success: false, message: 'Movie not found.' });

    // Find theatre and screen
    const theatre = await Theatre.findById(theatreId);
    if (!theatre) return res.status(404).json({ success: false, message: 'Theatre not found.' });

    const screen = theatre.screens.find((s) => s.name === screenId || s._id.toString() === screenId);
    if (!screen) return res.status(404).json({ success: false, message: 'Screen not found in this theatre.' });

    // Build seat array from screen layout
    const seats = [];
    const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const recliners  = screen.rows >= 2 ? 2 : 0;
    const premiums   = screen.rows >= 5 ? 3 : Math.max(0, screen.rows - recliners);

    for (let r = 0; r < screen.rows; r++) {
      const rowLetter = rowLetters[r] || `R${r}`;
      let category;
      if (r < recliners)                  category = 'recliner';
      else if (r < recliners + premiums)  category = 'premium';
      else                                category = 'standard';

      for (let c = 1; c <= screen.columns; c++) {
        const seatCode = screen.seatLayout[r] && screen.seatLayout[r][c - 1];
        if (seatCode === 'X') continue; // aisle / gap — skip
        seats.push({
          seatId:   `${rowLetter}${c}`,
          row:      rowLetter,
          col:      c,
          category,
          status:   'available',
          heldBy:   null,
          holdExpiresAt: null,
        });
      }
    }

    const show = await Show.create({
      movieId,
      theatreId,
      screenId,
      startTime,
      endTime,
      priceTiers: priceTiers || {},
      seats,
    });

    res.status(201).json({ success: true, data: show });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/shows/:id  (admin)
 */
const updateShow = async (req, res, next) => {
  try {
    const allowedUpdates = ['startTime', 'endTime', 'priceTiers'];
    const updates = {};
    allowedUpdates.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const show = await Show.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });
    if (!show) return res.status(404).json({ success: false, message: 'Show not found.' });
    res.json({ success: true, data: show });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/shows/:id  (admin) — cancel a show
 */
const cancelShow = async (req, res, next) => {
  try {
    const show = await Show.findByIdAndDelete(req.params.id);
    if (!show) return res.status(404).json({ success: false, message: 'Show not found.' });

    try {
      getIO().to(req.params.id).emit('show:cancelled', { showId: req.params.id });
    } catch (_) { /* ignore */ }

    res.json({ success: true, message: 'Show cancelled and deleted.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getShowById, getSeatMap, holdSeats, releaseSeats, createShow, updateShow, cancelShow };
