'use strict';

const QRCode = require('qrcode');

/**
 * Generates a QR code as a base64 PNG data URL from the given data object.
 * @param {object|string} data  – The booking info to encode.
 * @returns {Promise<string>}   – A data URL like "data:image/png;base64,..."
 */
const generateQRCode = async (data) => {
  try {
    const text = typeof data === 'string' ? data : JSON.stringify(data);
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 2,
    });
    return dataUrl;
  } catch (err) {
    console.error('[QRCode] Failed to generate QR code:', err.message);
    return '';
  }
};

module.exports = { generateQRCode };
