'use strict';

/**
 * Generates a unique booking code in the format: IMX-YYYYMMDD-XXXXXX
 * where XXXXXX is 6 uppercase alphanumeric characters.
 */
const generateBookingCode = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm   = String(now.getMonth() + 1).padStart(2, '0');
  const dd   = String(now.getDate()).padStart(2, '0');
  const datePart = `${yyyy}${mm}${dd}`;

  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars[Math.floor(Math.random() * chars.length)];
  }

  return `IMX-${datePart}-${randomPart}`;
};

module.exports = { generateBookingCode };
