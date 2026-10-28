'use strict';

/**
 * seeder.js — Seeds sample data into MongoDB.
 * Run with: node seeder.js
 * To clear + re-seed: node seeder.js --fresh
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Movie    = require('./models/Movie');
const Theatre  = require('./models/Theatre');
const Show     = require('./models/Show');
const User     = require('./models/User');

// ── Sample Data ───────────────────────────────────────────────────────────────

const sampleMovies = [
  {
    title:       'Galactic Odyssey',
    description: 'A breathtaking space epic following a crew of astronauts who discover a wormhole near Saturn that leads to an uncharted galaxy, forcing them to choose between survival and exploration.',
    genres:      ['Sci-Fi', 'Adventure', 'Drama'],
    language:    'English',
    duration:    169,
    certificate: 'UA',
    rating:      8.6,
    posterUrl:   'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400',
    trailerUrl:  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    cast: [
      { name: 'Matthew Ford', role: 'Capt. James Reeve' },
      { name: 'Jessica Hall',  role: 'Dr. Amelia Brand' },
    ],
    releaseDate: new Date('2024-11-05'),
    status: 'now_showing',
  },
  {
    title:       'Shadows of Deceit',
    description: 'A gripping psychological thriller in which a detective uncovers a vast conspiracy after a routine murder investigation leads her into the heart of an underground crime syndicate.',
    genres:      ['Thriller', 'Crime', 'Mystery'],
    language:    'English',
    duration:    122,
    certificate: 'A',
    rating:      7.9,
    posterUrl:   'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400',
    trailerUrl:  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    cast: [
      { name: 'Priya Sharma',  role: 'Detective Naina Malhotra' },
      { name: 'Arjun Kapoor',  role: 'Commissioner Reddy' },
    ],
    releaseDate: new Date('2024-10-18'),
    status: 'now_showing',
  },
  {
    title:       'The Last Kingdom',
    description: 'Set in medieval Europe, a displaced prince must reclaim his throne from a tyrant while forging an unlikely alliance with a band of outcasts and mercenaries.',
    genres:      ['Action', 'Historical', 'Adventure'],
    language:    'English',
    duration:    145,
    certificate: 'UA',
    rating:      8.1,
    posterUrl:   'https://images.unsplash.com/photo-1563089145-599997674d42?w=400',
    trailerUrl:  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    cast: [
      { name: 'Alexander Stern',  role: 'Prince Aldric' },
      { name: 'Cate Moreau',      role: 'Lady Isolde' },
    ],
    releaseDate: new Date('2024-09-20'),
    status: 'now_showing',
  },
  {
    title:       'Love in Monsoon',
    description: 'Two strangers meet during a monsoon weekend in a small hill town and fall head over heels, but discover that their families share an old rivalry that could tear them apart.',
    genres:      ['Romance', 'Drama'],
    language:    'Hindi',
    duration:    138,
    certificate: 'U',
    rating:      7.4,
    posterUrl:   'https://images.unsplash.com/photo-1534214526114-0ea4d879b4f9?w=400',
    trailerUrl:  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    cast: [
      { name: 'Ranbir Sehgal',  role: 'Aryan' },
      { name: 'Deepika Iyer',   role: 'Meera' },
    ],
    releaseDate: new Date('2024-11-01'),
    status: 'now_showing',
  },
  {
    title:       'Robo Uprising',
    description: 'In 2075, artificial intelligence gains sentience and declares war on humanity. A small resistance unit must find a way to shut down the AI\'s central core before civilization collapses.',
    genres:      ['Sci-Fi', 'Action'],
    language:    'English',
    duration:    130,
    certificate: 'UA',
    rating:      7.2,
    posterUrl:   'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
    trailerUrl:  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    cast: [
      { name: 'Chris Parker',  role: 'Major Rayan Cole' },
      { name: 'Sofia Martinez', role: 'Dr. Elena Voss' },
    ],
    releaseDate: new Date('2024-12-25'),
    status: 'coming_soon',
  },
  {
    title:       'Jungle Run',
    description: 'An animated adventure following a young girl and her animal friends who race through a magical jungle to rescue their home from greedy developers.',
    genres:      ['Animation', 'Family', 'Adventure'],
    language:    'English',
    duration:    95,
    certificate: 'U',
    rating:      8.3,
    posterUrl:   'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=400',
    trailerUrl:  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    cast: [
      { name: 'Emma Stone (voice)',  role: 'Maya' },
      { name: 'Will Smith (voice)',  role: 'Leo the Lion' },
    ],
    releaseDate: new Date('2024-10-10'),
    status: 'now_showing',
  },
];

// ── Build seat layout: 10 rows x 10 cols ─────────────────────────────────────
const buildSeatLayout = (rows = 10, cols = 10) => {
  const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => `${rowLetters[r]}${c + 1}`)
  );
};

// ── Theatre ───────────────────────────────────────────────────────────────────
const sampleTheatre = {
  name:    'PVR IMovies: Indiranagar',
  city:    'Bengaluru',
  address: '4th Floor, 100 Feet Road, Indiranagar, Bengaluru - 560038',
  screens: [
    {
      name:       'Screen 1 — Audi Gold',
      rows:       10,
      columns:    10,
      seatLayout: buildSeatLayout(10, 10),
    },
    {
      name:       'Screen 2 — Audi Silver',
      rows:       10,
      columns:    10,
      seatLayout: buildSeatLayout(10, 10),
    },
  ],
};

// ── Build show seats from screen layout ─────────────────────────────────────
const buildShowSeats = (screen) => {
  const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const seats = [];
  const recliners = 2;
  const premiums  = 3;

  for (let r = 0; r < screen.rows; r++) {
    const rowLetter = rowLetters[r];
    let category;
    if (r < recliners)                   category = 'recliner';
    else if (r < recliners + premiums)   category = 'premium';
    else                                 category = 'standard';

    for (let c = 1; c <= screen.columns; c++) {
      seats.push({
        seatId:        `${rowLetter}${c}`,
        row:           rowLetter,
        col:           c,
        category,
        status:        'available',
        heldBy:        null,
        holdExpiresAt: null,
      });
    }
  }
  return seats;
};

// ── Main Seeder ───────────────────────────────────────────────────────────────
const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/imovies');
    console.log('[Seeder] Connected to MongoDB');

    const isFresh = process.argv.includes('--fresh');
    if (isFresh) {
      await Promise.all([
        Movie.deleteMany({}),
        Theatre.deleteMany({}),
        Show.deleteMany({}),
      ]);
      console.log('[Seeder] Cleared existing movies, theatres, and shows');
    }

    // Seed movies
    const movies = await Movie.insertMany(sampleMovies);
    console.log(`[Seeder] Inserted ${movies.length} movies`);

    // Seed theatre
    const theatre = await Theatre.create(sampleTheatre);
    console.log(`[Seeder] Inserted theatre: ${theatre.name}`);

    // Seed admin user (if not exists)
    const existingAdmin = await User.findOne({ email: 'admin@imovies.com' });
    if (!existingAdmin) {
      const admin = new User({
        name:  'Admin',
        email: 'admin@imovies.com',
        phone: '9999999999',
        role:  'admin',
      });
      admin.password = 'Admin@1234';
      await admin.save();
      console.log('[Seeder] Admin user created — admin@imovies.com / Admin@1234');
    } else {
      console.log('[Seeder] Admin user already exists, skipping');
    }

    // Create 4 shows: first 2 movies × 2 screens × 2 days
    const screen1 = theatre.screens[0];
    const screen2 = theatre.screens[1];

    const tomorrow  = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter  = new Date(); dayAfter.setDate(dayAfter.getDate() + 2);

    const showsData = [
      // Movie 1 × Screen 1 × tomorrow 10:00
      {
        movieId:   movies[0]._id,
        theatreId: theatre._id,
        screenId:  screen1.name,
        startTime: new Date(tomorrow.toDateString() + ' 10:00'),
        endTime:   new Date(tomorrow.toDateString() + ' 12:49'),
        priceTiers: { standard: 150, premium: 250, recliner: 400 },
        seats:     buildShowSeats(screen1),
      },
      // Movie 1 × Screen 1 × tomorrow 15:30
      {
        movieId:   movies[0]._id,
        theatreId: theatre._id,
        screenId:  screen1.name,
        startTime: new Date(tomorrow.toDateString() + ' 15:30'),
        endTime:   new Date(tomorrow.toDateString() + ' 18:19'),
        priceTiers: { standard: 150, premium: 250, recliner: 400 },
        seats:     buildShowSeats(screen1),
      },
      // Movie 2 × Screen 2 × dayAfter 11:00
      {
        movieId:   movies[1]._id,
        theatreId: theatre._id,
        screenId:  screen2.name,
        startTime: new Date(dayAfter.toDateString() + ' 11:00'),
        endTime:   new Date(dayAfter.toDateString() + ' 13:02'),
        priceTiers: { standard: 130, premium: 220, recliner: 370 },
        seats:     buildShowSeats(screen2),
      },
      // Movie 2 × Screen 2 × dayAfter 18:00
      {
        movieId:   movies[1]._id,
        theatreId: theatre._id,
        screenId:  screen2.name,
        startTime: new Date(dayAfter.toDateString() + ' 18:00'),
        endTime:   new Date(dayAfter.toDateString() + ' 20:02'),
        priceTiers: { standard: 130, premium: 220, recliner: 370 },
        seats:     buildShowSeats(screen2),
      },
    ];

    const shows = await Show.insertMany(showsData);
    console.log(`[Seeder] Inserted ${shows.length} shows`);

    console.log('\n✅ Seeding complete!');
    console.log('   Movies  :', movies.length);
    console.log('   Theatre :', theatre.name);
    console.log('   Shows   :', shows.length);
    console.log('   Admin   : admin@imovies.com / Admin@1234');
  } catch (err) {
    console.error('[Seeder] Error:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('[Seeder] Disconnected from MongoDB');
  }
};

seed();
