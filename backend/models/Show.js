'use strict';

const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    seatId:  { type: String, required: true },
    row:     { type: String, required: true },
    col:     { type: Number, required: true },
    category: {
      type: String,
      enum: ['standard', 'premium', 'recliner'],
      default: 'standard',
    },
    status: {
      type: String,
      enum: ['available', 'held', 'booked'],
      default: 'available',
    },
    heldBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    holdExpiresAt: { type: Date, default: null },
  },
  { _id: false }
);

const priceTierSchema = new mongoose.Schema(
  {
    standard: { type: Number, default: 150 },
    premium:  { type: Number, default: 250 },
    recliner: { type: Number, default: 400 },
  },
  { _id: false }
);

const showSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: [true, 'Movie is required'],
    },
    theatreId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: [true, 'Theatre is required'],
    },
    screenId: {
      type: String,
      required: [true, 'Screen is required'],
    },
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
    },
    priceTiers: {
      type: priceTierSchema,
      default: () => ({}),
    },
    seats: {
      type: [seatSchema],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

showSchema.index({ movieId: 1, startTime: 1 });
showSchema.index({ theatreId: 1, startTime: 1 });

module.exports = mongoose.model('Show', showSchema);
