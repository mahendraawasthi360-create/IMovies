import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Clock, Star, Globe, Tag, Calendar, ChevronLeft, Play, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import ShowtimeSelector from '../components/ShowtimeSelector'
import { getMockMovieById, getMockShowsForMovie } from '../data/mockData'

const CERTIFICATE_COLORS = {
  U:   'bg-green-700',
  UA:  'bg-yellow-700',
  'U/A': 'bg-yellow-700',
  A:   'bg-red-700',
  S:   'bg-purple-700',
}

export default function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie]   = useState(null)
  const [shows, setShows]   = useState([])
  const [loading, setLoading] = useState(true)
  const [usingMock, setUsingMock] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      // If it's a mock ID (e.g. "movie_01"), skip API entirely
      const isMockId = id.startsWith('movie_')
      if (isMockId) {
        const mockMovie = getMockMovieById(id)
        if (mockMovie) {
          setMovie(mockMovie)
          setShows(getMockShowsForMovie(id))
          setUsingMock(true)
        } else {
          navigate('/')
        }
        setLoading(false)
        return
      }

      try {
        // Try live API first
        const movieRes = await api.get(`/movies/${id}`)
        const movieData = movieRes.data.data || movieRes.data.movie || movieRes.data
        setMovie(movieData)

        // Fetch shows for this movie
        try {
          const showsRes = await api.get(`/movies/${id}/shows`)
          const showsData = showsRes.data.data || showsRes.data.shows || showsRes.data || []
          setShows(Array.isArray(showsData) ? showsData : [])
        } catch {
          setShows([])
        }
      } catch {
        // Fallback to mock data
        const mockMovie = getMockMovieById(id)
        if (mockMovie) {
          setMovie(mockMovie)
          setShows(getMockShowsForMovie(id))
          setUsingMock(true)
        } else {
          toast.error('Movie not found')
          navigate('/')
          return
        }
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleSelectShow = (show) => {
    if (usingMock) {
      toast('🎭 Demo mode — seat selection needs a live backend.', { icon: 'ℹ️' })
      return
    }
    navigate(`/shows/${show._id}/seats`)
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!movie) return null

  const {
    title, posterUrl, genres = [], duration, certificate, rating,
    description, synopsis, language, cast = [], trailerUrl, releaseDate, status,
  } = movie

  const certColor = CERTIFICATE_COLORS[certificate] || 'bg-gray-700'
  const synopsis_ = synopsis || description || ''

  return (
    <div className="min-h-screen pb-16">
      {/* Blurred backdrop */}
      <div className="relative h-72 overflow-hidden">
        {posterUrl && (
          <div
            className="absolute inset-0 bg-cover bg-center blur-2xl opacity-20 scale-110"
            style={{ backgroundImage: `url(${posterUrl})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 to-gray-950" />
      </div>

      {/* Demo banner */}
      {usingMock && (
        <div className="bg-indigo-900/60 border-b border-indigo-700/50 text-center py-2 px-4">
          <p className="text-indigo-200 text-sm">
            🎭 <strong>Demo mode</strong> — showing sample data. Start backend to enable ticket booking.
          </p>
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-56 pb-8">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white mb-6 transition-colors text-sm"
        >
          <ChevronLeft size={18} /> Back
        </button>

        {/* ── Movie Header ──────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="shrink-0 w-full md:w-56">
            {posterUrl ? (
              <img
                src={posterUrl} alt={title}
                className="w-full md:w-56 rounded-2xl shadow-2xl object-cover aspect-[2/3]"
                onError={(e) => { e.target.style.display = 'none' }}
              />
            ) : (
              <div className="w-full md:w-56 aspect-[2/3] bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl flex items-center justify-center">
                <span className="text-7xl">🎬</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-4 pt-2">
            <div className="flex flex-wrap items-start gap-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white flex-1 leading-tight">{title}</h1>
              {certificate && (
                <span className={`${certColor} text-white text-sm font-bold px-2.5 py-1 rounded-lg shrink-0`}>
                  {certificate}
                </span>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2">
              {genres.map((g) => (
                <span key={g} className="flex items-center gap-1 text-sm bg-indigo-900/50 text-indigo-300 border border-indigo-700/50 px-3 py-1 rounded-full">
                  <Tag size={11} /> {g}
                </span>
              ))}
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-5 text-sm text-gray-300">
              {duration && (
                <span className="flex items-center gap-2">
                  <Clock size={15} className="text-indigo-400" />
                  {Math.floor(duration / 60)}h {duration % 60}m
                </span>
              )}
              {language && (
                <span className="flex items-center gap-2">
                  <Globe size={15} className="text-indigo-400" /> {language}
                </span>
              )}
              {releaseDate && (
                <span className="flex items-center gap-2">
                  <Calendar size={15} className="text-indigo-400" />
                  {new Date(releaseDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              )}
              {rating > 0 && (
                <span className="flex items-center gap-1.5 text-yellow-400 font-semibold">
                  <Star size={15} className="fill-yellow-400" />
                  {Number(rating).toFixed(1)} / 10
                </span>
              )}
            </div>

            {/* Coming Soon badge */}
            {status === 'coming_soon' && (
              <span className="inline-block bg-purple-700 text-purple-100 text-xs font-semibold px-3 py-1 rounded-full">
                Coming Soon
              </span>
            )}

            {/* Synopsis */}
            {synopsis_ && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Synopsis</h3>
                <p className="text-gray-300 leading-relaxed">{synopsis_}</p>
              </div>
            )}

            {/* Trailer button */}
            {trailerUrl && (
              <a
                href={trailerUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 bg-red-700 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-xl transition"
              >
                <Play size={16} className="fill-white" /> Watch Trailer
              </a>
            )}

            {/* Cast */}
            {cast.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Cast</h3>
                <div className="flex flex-wrap gap-2">
                  {cast.map((actor, i) => (
                    <span key={i} className="text-sm bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-gray-300">
                      <span className="text-white font-medium">
                        {typeof actor === 'string' ? actor : actor.name}
                      </span>
                      {actor.role && (
                        <span className="text-gray-500 text-xs ml-1">as {actor.role}</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Showtimes ──────────────────────────────────────────── */}
        {status !== 'coming_soon' && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-5 bg-indigo-500 rounded-full inline-block" />
              Book Tickets
            </h2>

            {shows.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
                <p className="text-gray-400">No shows scheduled for this movie yet.</p>
              </div>
            ) : (
              <ShowtimeSelector shows={shows} onSelectShow={handleSelectShow} />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
