import { useState, useEffect } from 'react'
import { Search, Filter, ChevronDown } from 'lucide-react'
import MovieCard from '../components/MovieCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import api from '../services/api'
import { MOCK_MOVIES } from '../data/mockData'

const GENRES = ['Action', 'Comedy', 'Drama', 'Horror', 'Thriller', 'Romance', 'Sci-Fi', 'Animation', 'Adventure', 'Crime', 'History']

export default function Home() {
  const [nowShowing, setNowShowing] = useState([])
  const [comingSoon, setComingSoon] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [usingMock, setUsingMock] = useState(false)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const [nowRes, soonRes] = await Promise.all([
          api.get('/movies', { params: { status: 'now_showing', limit: 20 } }),
          api.get('/movies', { params: { status: 'coming_soon', limit: 8 } }),
        ])
        const nowData  = nowRes.data.data  || nowRes.data.movies  || nowRes.data  || []
        const soonData = soonRes.data.data || soonRes.data.movies || soonRes.data || []
        setNowShowing(Array.isArray(nowData)  ? nowData  : [])
        setComingSoon(Array.isArray(soonData) ? soonData : [])
      } catch {
        // Backend not available — load static demo data
        setNowShowing(MOCK_MOVIES.filter((m) => m.status === 'now_showing'))
        setComingSoon(MOCK_MOVIES.filter((m) => m.status === 'coming_soon'))
        setUsingMock(true)
      } finally {
        setLoading(false)
      }
    }
    fetchMovies()
  }, [])

  const filtered = nowShowing.filter((m) => {
    const matchSearch = m.title?.toLowerCase().includes(search.toLowerCase())
    const matchGenre  = !selectedGenre || m.genres?.includes(selectedGenre)
    return matchSearch && matchGenre
  })

  return (
    <div className="min-h-screen">
      {/* ── Hero Banner ─────────────────────────────────────────── */}
      <div className="relative h-[52vh] min-h-[320px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-indigo-950 to-purple-950" />
        <div className="absolute w-96 h-96 bg-indigo-700/20 rounded-full -top-20 -left-20 blur-3xl animate-pulse" />
        <div className="absolute w-80 h-80 bg-purple-700/20 rounded-full bottom-0 right-0 blur-3xl animate-pulse"
          style={{ animationDelay: '1s' }} />

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <div className="text-6xl mb-4">🎬</div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
            Book Your Perfect{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Movie Night
            </span>
          </h1>
          <p className="text-gray-300 text-lg mb-8">
            Browse the latest releases, pick your seats, and enjoy the show.
          </p>
          {/* Search bar */}
          <div className="relative max-w-md mx-auto">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search movies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/10 border border-white/20 backdrop-blur-sm rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-indigo-400 transition"
            />
          </div>
        </div>
      </div>

      {/* ── Demo banner ─────────────────────────────────────────── */}
      {usingMock && (
        <div className="bg-indigo-900/60 border-b border-indigo-700/50 text-center py-2 px-4">
          <p className="text-indigo-200 text-sm">
            🎭 <strong>Demo mode</strong> — showing sample data. Start MongoDB + backend to use live data.
          </p>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ── Now Showing ─────────────────────────────────────────── */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-indigo-500 rounded-full inline-block" />
                Now Showing
              </h2>
              <p className="text-gray-400 text-sm mt-1">Currently in theatres near you</p>
            </div>

            {/* Genre filter */}
            <div className="relative">
              <Filter size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded-lg pl-9 pr-8 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition appearance-none cursor-pointer"
              >
                <option value="">All Genres</option>
                {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <LoadingSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <Search size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-lg">No movies found</p>
              <p className="text-sm mt-1">Try a different search or genre filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filtered.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          )}
        </section>

        {/* ── Coming Soon ─────────────────────────────────────────── */}
        {comingSoon.length > 0 && (
          <section className="mt-16">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="w-1 h-6 bg-purple-500 rounded-full inline-block" />
                Coming Soon
              </h2>
              <p className="text-gray-400 text-sm mt-1">Mark your calendars</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {comingSoon.map((movie) => (
                <MovieCard key={movie._id} movie={movie} comingSoon />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
