'use strict';

const nodemailer = require('nodemailer');

// Create reusable transporter using SMTP credentials from .env
const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: false, // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

/**
 * Sends a booking confirmation email.
 * @param {string} to              – Recipient email address
 * @param {object} bookingDetails  – { bookingCode, movieTitle, showTime, theatreName, seats, totalAmount, qrCode }
 */
const sendBookingConfirmation = async (to, bookingDetails) => {
  const {
    bookingCode,
    movieTitle,
    showTime,
    theatreName,
    seats = [],
    totalAmount,
    qrCode,
  } = bookingDetails;

  const seatList = seats.map((s) => `${s.seatId} (${s.category})`).join(', ');
  const showDate = new Date(showTime).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 32px auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: #e50914; padding: 24px; text-align: center; color: #fff; }
        .header h1 { margin: 0; font-size: 28px; letter-spacing: 2px; }
        .body { padding: 32px; }
        .booking-code { font-size: 22px; font-weight: bold; color: #e50914; letter-spacing: 2px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        td { padding: 8px 0; border-bottom: 1px solid #eee; }
        td:first-child { color: #888; font-size: 13px; }
        td:last-child { font-weight: 600; }
        .total { font-size: 18px; color: #e50914; }
        .qr { text-align: center; margin: 24px 0; }
        .qr img { width: 180px; height: 180px; }
        .footer { text-align: center; font-size: 12px; color: #aaa; padding: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎬 IMovies</h1>
          <p style="margin:4px 0 0;font-size:14px;">Your booking is confirmed!</p>
        </div>
        <div class="body">
          <p>Hi there! Here are the details for your booking:</p>
          <div class="booking-code">${bookingCode}</div>
          <table>
            <tr><td>Movie</td><td>${movieTitle}</td></tr>
            <tr><td>Show Time</td><td>${showDate}</td></tr>
            <tr><td>Theatre</td><td>${theatreName}</td></tr>
            <tr><td>Seats</td><td>${seatList}</td></tr>
            <tr><td>Total Paid</td><td class="total">₹${totalAmount}</td></tr>
          </table>
          ${qrCode ? `<div class="qr"><p style="color:#888;font-size:13px;">Scan QR code at the theatre</p><img src="${qrCode}" alt="QR Code" /></div>` : ''}
          <p style="margin-top:24px;color:#555;font-size:14px;">Please arrive 15 minutes before the show. Enjoy the movie! 🍿</p>
        </div>
        <div class="footer">&copy; ${new Date().getFullYear()} IMovies. All rights reserved.</div>
      </div>
    </body>
    </html>
  `;

  const transporter = createTransporter();
  const mailOptions = {
    from: `"IMovies 🎬" <${process.env.EMAIL_USER}>`,
    to,
    subject: `🎟️ Booking Confirmed – ${bookingCode} | ${movieTitle}`,
    html: htmlBody,
  };

  await transporter.sendMail(mailOptions);
  console.log(`[Email] Booking confirmation sent to ${to}`);
};

module.exports = { sendBookingConfirmation };
