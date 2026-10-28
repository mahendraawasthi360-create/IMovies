// ─────────────────────────────────────────────────────────────────────────────
// Static mock data — displayed when the backend / MongoDB is not running.
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_THEATRE = {
  _id: 'theatre_01',
  name: 'IMovies Grand Cineplex',
  city: 'Mumbai',
  address: 'Lower Parel, Phoenix Mills, Mumbai – 400013',
  screens: [
    { _id: 'screen_01', name: 'Screen 1 – Recliner', rows: 10, columns: 12 },
    { _id: 'screen_02', name: 'Screen 2 – Premium', rows: 12, columns: 14 },
  ],
}

// ─── 6 Movies ────────────────────────────────────────────────────────────────

export const MOCK_MOVIES = [
  {
    _id: 'movie_01',
    title: 'Kalki 2898 AD',
    description:
      'Set in a post-apocalyptic world in the year 2898 AD, a reluctant warrior discovers he is destined to be the tenth avatar of Vishnu. Blending Indian mythology with sci-fi spectacle, this epic follows his journey to protect the last hope of humanity.',
    genres: ['Action', 'Sci-Fi', 'Drama'],
    language: 'Hindi',
    duration: 181,
    certificate: 'UA',
    rating: 8.4,
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/2/24/Kalki_2898_AD_-_Official_Theatrical_Poster.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=nWrRPY6MHs4',
    cast: [
      { name: 'Prabhas',        role: 'Kalki / Bhairava' },
      { name: 'Deepika Padukone', role: 'SUM-80 (Sumathi)' },
      { name: 'Amitabh Bachchan', role: 'Ashwatthama' },
      { name: 'Kamal Haasan',   role: 'Supreme Yaskin' },
    ],
    releaseDate: '2024-06-27',
    status: 'now_showing',
  },
  {
    _id: 'movie_02',
    title: 'Fighter',
    description:
      'India\'s first aerial action franchise. A group of fearless air-warriors led by Squadron Leader Shamsher Pathania embark on a mission to counter a deadly terror threat in the skies over South Asia.',
    genres: ['Action', 'Thriller'],
    language: 'Hindi',
    duration: 166,
    certificate: 'UA',
    rating: 7.2,
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/6/6d/Fighter_2024_film_poster.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=GNsKMB3QRFA',
    cast: [
      { name: 'Hrithik Roshan', role: 'Sq. Ldr. Shamsher Pathania' },
      { name: 'Deepika Padukone', role: 'Sq. Ldr. Minal Rathore' },
      { name: 'Anil Kapoor',    role: 'Group Capt. Rakesh Jai Singh' },
    ],
    releaseDate: '2024-01-25',
    status: 'now_showing',
  },
  {
    _id: 'movie_03',
    title: 'Stree 2',
    description:
      'The supernatural legend of Stree returns to the town of Chanderi. The townsmen must once again unite against a terrifying new evil while uncovering the truth behind the mysterious female spirit.',
    genres: ['Horror', 'Comedy'],
    language: 'Hindi',
    duration: 145,
    certificate: 'UA',
    rating: 8.7,
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/3/3e/Stree_2_poster.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=BEQ3CSmQpb4',
    cast: [
      { name: 'Rajkummar Rao',   role: 'Vicky' },
      { name: 'Shraddha Kapoor', role: 'Stree' },
      { name: 'Pankaj Tripathi', role: 'Rudra' },
      { name: 'Aparshakti Khurana', role: 'Bittu' },
    ],
    releaseDate: '2024-08-15',
    status: 'now_showing',
  },
  {
    _id: 'movie_04',
    title: 'Pushpa 2: The Rule',
    description:
      'Pushpa Raj expands his red-sandalwood smuggling empire across India, coming into violent conflict with a new, ruthless police officer who vows to bring him down. A saga of power, betrayal, and unstoppable ambition.',
    genres: ['Action', 'Crime', 'Drama'],
    language: 'Telugu',
    duration: 210,
    certificate: 'A',
    rating: 8.0,
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/3/30/Pushpa_2_The_Rule_poster.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=Q7NDIVeKSX0',
    cast: [
      { name: 'Allu Arjun',   role: 'Pushpa Raj' },
      { name: 'Rashmika Mandanna', role: 'Srivalli' },
      { name: 'Fahadh Faasil', role: 'DSP Bhanwar Singh Shekhawat' },
    ],
    releaseDate: '2024-12-05',
    status: 'now_showing',
  },
  {
    _id: 'movie_05',
    title: 'Devara: Part 1',
    description:
      'A fearless sea-lord who ruled the coastal crime world through terror passes his legacy to his timid son. But when old enemies resurface, the son must dig deep and transform into someone his father never expected.',
    genres: ['Action', 'Thriller', 'Drama'],
    language: 'Telugu',
    duration: 166,
    certificate: 'UA',
    rating: 7.5,
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/1/12/Devara_Part_1_poster.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=AOqVHbLEEpU',
    cast: [
      { name: 'Jr. NTR',       role: 'Devara / Vara' },
      { name: 'Saif Ali Khan', role: 'Bhaira' },
      { name: 'Janhvi Kapoor', role: 'Thangam' },
    ],
    releaseDate: '2024-09-27',
    status: 'now_showing',
  },
  {
    _id: 'movie_06',
    title: 'Sky Force',
    description:
      'Based on India\'s first aerial strike, this patriotic drama recounts the 1965 Sargodha mission by the Indian Air Force — the most daring and deadliest air-battle in Indian history.',
    genres: ['Action', 'Drama', 'History'],
    language: 'Hindi',
    duration: 150,
    certificate: 'UA',
    rating: 7.8,
    posterUrl: 'https://upload.wikimedia.org/wikipedia/en/5/51/Sky_Force_film_poster.jpg',
    trailerUrl: 'https://www.youtube.com/watch?v=dBiK1l6YSME',
    cast: [
      { name: 'Akshay Kumar',   role: 'Air Marshal Vijay Karnik' },
      { name: 'Veer Pahariya',  role: 'T. Vijaya' },
      { name: 'Sara Ali Khan',  role: 'Seema' },
    ],
    releaseDate: '2025-01-24',
    status: 'coming_soon',
  },
]

// ─── 4 Shows (next 2 days, 2 movies × 2 slots) ───────────────────────────────

const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)
tomorrow.setHours(10, 0, 0, 0)

const mkDate = (daysAhead, hour, min = 0) => {
  const d = new Date()
  d.setDate(d.getDate() + daysAhead)
  d.setHours(hour, min, 0, 0)
  return d.toISOString()
}

export const MOCK_SHOWS = [
  {
    _id: 'show_01',
    movieId: MOCK_MOVIES[0], // Kalki 2898 AD
    theatreId: MOCK_THEATRE,
    screenId: 'Screen 1 – Recliner',
    startTime: mkDate(1, 10, 0),
    endTime:   mkDate(1, 13, 1),
    priceTiers: { standard: 180, premium: 280, recliner: 450 },
    seatStats: { totalSeats: 100, availableSeats: 68, bookedSeats: 28, heldSeats: 4 },
  },
  {
    _id: 'show_02',
    movieId: MOCK_MOVIES[0], // Kalki 2898 AD
    theatreId: MOCK_THEATRE,
    screenId: 'Screen 2 – Premium',
    startTime: mkDate(1, 18, 30),
    endTime:   mkDate(1, 21, 31),
    priceTiers: { standard: 180, premium: 280, recliner: 450 },
    seatStats: { totalSeats: 150, availableSeats: 112, bookedSeats: 30, heldSeats: 8 },
  },
  {
    _id: 'show_03',
    movieId: MOCK_MOVIES[2], // Stree 2
    theatreId: MOCK_THEATRE,
    screenId: 'Screen 1 – Recliner',
    startTime: mkDate(2, 14, 0),
    endTime:   mkDate(2, 16, 25),
    priceTiers: { standard: 150, premium: 250, recliner: 400 },
    seatStats: { totalSeats: 100, availableSeats: 45, bookedSeats: 50, heldSeats: 5 },
  },
  {
    _id: 'show_04',
    movieId: MOCK_MOVIES[2], // Stree 2
    theatreId: MOCK_THEATRE,
    screenId: 'Screen 2 – Premium',
    startTime: mkDate(2, 21, 0),
    endTime:   mkDate(2, 23, 25),
    priceTiers: { standard: 150, premium: 250, recliner: 400 },
    seatStats: { totalSeats: 150, availableSeats: 130, bookedSeats: 15, heldSeats: 5 },
  },
]

// Helper: get shows for a given movieId
export const getMockShowsForMovie = (movieId) =>
  MOCK_SHOWS.filter((s) => s.movieId._id === movieId)

// Helper: get movie by id
export const getMockMovieById = (id) =>
  MOCK_MOVIES.find((m) => m._id === id) || null
