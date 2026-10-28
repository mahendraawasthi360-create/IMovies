'use strict';

const mongoose = require('mongoose');

const screenSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    rows: { type: Number, required: true, min: 1 },
    columns: { type: Number, required: true, min: 1 },
    // 2-D matrix: each cell is a seat code (e.g. 'A1') or 'X' for aisle/gap
    seatLayout: { type: [[String]], default: [] },
  },
  { _id: true }
);

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
    },
    screens: {
      type: [screenSchema],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

module.exports = mongoose.model('Theatre', theatreSchema);
