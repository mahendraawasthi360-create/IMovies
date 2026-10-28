# 🎬 IMovies – Online Movie Booking Platform

A full-stack MERN application for browsing movies, selecting seats in real-time, and booking cinema tickets.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, Socket.IO Client |
| Backend | Node.js, Express.js, Socket.IO |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT + bcryptjs |
| Real-time | Socket.IO (WebSockets) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)

### 1. Clone & Setup

```bash
cd d:\iMAx
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev        # Starts on http://localhost:5000
```

### 3. Seed Sample Data (Optional)

```bash
cd backend
node seeder.js     # Seeds movies, theatre, and shows
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev        # Starts on http://localhost:5173
```

---

## 🔑 Environment Variables (`backend/.env`)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/imovies
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

---

## 📁 Project Structure

```
d:\iMAx\
├── backend/
│   ├── config/db.js              # MongoDB connection
│   ├── controllers/              # Business logic
│   │   ├── authController.js
│   │   ├── movieController.js
│   │   ├── theatreController.js
│   │   ├── showController.js
│   │   ├── bookingController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js               # JWT protect + adminOnly
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── models/                   # Mongoose schemas
│   │   ├── User.js
│   │   ├── Movie.js
│   │   ├── Theatre.js
│   │   ├── Show.js
│   │   └── Booking.js
│   ├── routes/                   # Express routers
│   ├── utils/                    # bookingCode, QR, email
│   ├── seeder.js                 # Sample data seeder
│   └── server.js                 # Main entry + Socket.IO
│
└── frontend/
    └── src/
        ├── components/           # Navbar, Footer, SeatMap, MovieCard...
        ├── context/AuthContext   # JWT auth state
        ├── pages/
        │   ├── Home.jsx
        │   ├── MovieDetail.jsx
        │   ├── SeatSelection.jsx (real-time)
        │   ├── BookingConfirmation.jsx
        │   ├── MyBookings.jsx
        │   ├── Login.jsx / Register.jsx
        │   └── admin/            # Dashboard, Movies, Theatres, Shows, Bookings
        └── services/
            ├── api.js            # Axios instance
            └── socket.js         # Socket.IO client
```

---

## 🌐 API Reference

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Register user | Public |
| POST | `/api/auth/login` | Login + JWT | Public |
| GET | `/api/auth/profile` | Get profile | 🔐 |
| GET | `/api/movies` | List/search movies | Public |
| GET | `/api/movies/:id` | Movie detail | Public |
| GET | `/api/movies/:id/shows` | Shows for movie | Public |
| GET | `/api/shows/:id/seats` | Seat map | Public |
| POST | `/api/shows/:id/hold` | Hold seats (5 min) | 🔐 |
| POST | `/api/shows/:id/release` | Release held seats | 🔐 |
| POST | `/api/bookings` | Confirm booking | 🔐 |
| GET | `/api/bookings/me` | My bookings | 🔐 |
| PATCH | `/api/bookings/:id/cancel` | Cancel booking | 🔐 |
| GET | `/api/admin/dashboard` | Stats | 🔐 Admin |
| GET | `/api/admin/bookings` | All bookings | 🔐 Admin |
| POST | `/api/movies` | Add movie | 🔐 Admin |
| POST | `/api/theatres` | Add theatre | 🔐 Admin |
| POST | `/api/shows` | Schedule show | 🔐 Admin |

---

## 💡 Key Features

- **Real-time seat map** — Socket.IO emits `seats:updated` to all users viewing a show
- **5-minute hold** — seats are atomically held to prevent double booking
- **JWT Authentication** — secure login with role-based access (user/admin)
- **Admin Panel** — full CRUD for movies, theatres, shows; booking overview
- **QR Code tickets** — each booking gets a unique code + QR
- **Email confirmation** — nodemailer sends booking details
- **Dark cinema UI** — Tailwind CSS, mobile-first design

---

## 👤 Default Admin

After seeding, create an admin by updating a user's role in MongoDB:
```js
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
```
