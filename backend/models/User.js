'use strict';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: {
      transform(_doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Virtual setter: writing `user.password = 'plain'` stores in _password for pre-save to hash
userSchema.virtual('password').set(function (plainPassword) {
  this._password = plainPassword;
  // Set a temporary placeholder so the 'required' validator doesn't fire on new docs
  if (!this.passwordHash) {
    this.passwordHash = 'pending';
  }
});

// Pre-save hook: hash password if _password is set or passwordHash was modified
userSchema.pre('save', async function (next) {
  try {
    // If a plain-text password was provided via virtual
    if (this._password) {
      this.passwordHash = await bcrypt.hash(this._password, SALT_ROUNDS);
      this._password = undefined;
    } else if (this.isModified('passwordHash') && !this.passwordHash.startsWith('$2')) {
      // Direct passwordHash modification with plain text
      this.passwordHash = await bcrypt.hash(this.passwordHash, SALT_ROUNDS);
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Instance method: compare a candidate password against the stored hash
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
