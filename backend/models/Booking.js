'use strict';

const mongoose = require('mongoose');

const bookedSeatSchema = new mongoose.Schema(
  {
    seatId:   { type: String, required: true },
    category: { type: String, required: true },
    price:    { type: Number, required: true },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    showId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: [true, 'Show is required'],
    },
    seats: {
      type: [bookedSeatSchema],
      default: [],
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'confirmed',
    },
    paymentId: {
      type: String,
      default: '',
    },
    bookingCode: {
      type: String,
      unique: true,
      required: [true, 'Booking code is required'],
    },
    qrCode: {
      type: String, // base64 data URL
      default: '',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

bookingSchema.index({ userId: 1, createdAt: -1 });
bookingSchema.index({ showId: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
