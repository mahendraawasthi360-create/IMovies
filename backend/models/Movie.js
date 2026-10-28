'use strict';

const mongoose = require('mongoose');

const castSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    role: { type: String, trim: true },
  },
  { _id: false }
);

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    genres: {
      type: [String],
      default: [],
    },
    language: {
      type: String,
      default: 'English',
      trim: true,
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 minute'],
      comment: 'Duration in minutes',
    },
    certificate: {
      type: String,
      enum: ['U', 'UA', 'A', 'S'],
      default: 'UA',
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    posterUrl: {
      type: String,
      default: '',
    },
    trailerUrl: {
      type: String,
      default: '',
    },
    cast: {
      type: [castSchema],
      default: [],
    },
    releaseDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['now_showing', 'coming_soon', 'ended'],
      default: 'now_showing',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Text index for search
movieSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Movie', movieSchema);
