'use strict';

const Booking = require('../models/Booking');
const Movie   = require('../models/Movie');
const Show    = require('../models/Show');

/**
 * GET /api/admin/bookings  (adminOnly)
 * Query params: status, page, limit, userId, showId
 */
const getAllBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, userId, showId } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    if (showId) filter.showId = showId;

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Booking.countDocuments(filter);

    const bookings = await Booking.find(filter)
      .populate('userId', 'name email phone')
      .populate({
        path: 'showId',
        populate: [
          { path: 'movieId',   select: 'title' },
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
 * GET /api/admin/dashboard  (adminOnly)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [
      totalMovies,
      showsToday,
      bookingsToday,
      revenueResult,
      totalBookings,
      totalUsers,
    ] = await Promise.all([
      Movie.countDocuments(),
      Show.countDocuments({ startTime: { $gte: todayStart, $lte: todayEnd } }),
      Booking.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd }, status: 'confirmed' }),
      Booking.aggregate([
        { $match: { createdAt: { $gte: todayStart, $lte: todayEnd }, status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } },
      ]),
      Booking.countDocuments({ status: 'confirmed' }),
      // We don't import User model to keep it light; just estimate via Booking distinct userId
      Booking.distinct('userId').then((ids) => ids.length),
    ]);

    const revenueToday = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Top 5 movies by booking count (all time)
    const topMovies = await Booking.aggregate([
      { $match: { status: 'confirmed' } },
      { $lookup: { from: 'shows', localField: 'showId', foreignField: '_id', as: 'show' } },
      { $unwind: '$show' },
      { $group: { _id: '$show.movieId', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'movies', localField: '_id', foreignField: '_id', as: 'movie' } },
      { $unwind: '$movie' },
      { $project: { title: '$movie.title', posterUrl: '$movie.posterUrl', count: 1, revenue: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalMovies,
        showsToday,
        bookingsToday,
        revenueToday,
        totalBookings,
        totalUsers,
        topMovies,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllBookings, getDashboardStats };
