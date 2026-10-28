import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Star, Clock, Tag } from 'lucide-react'

const CERTIFICATE_COLORS = {
  U: 'bg-green-700 text-green-100',
  'U/A': 'bg-yellow-700 text-yellow-100',
  A: 'bg-red-700 text-red-100',
  S: 'bg-purple-700 text-purple-100',
}

export default function MovieCard({ movie }) {
  const [imgError, setImgError] = useState(false)

  const {
    _id,
    title,
    posterUrl,
    genres = [],
    duration,
    certificate,
    rating,
    status,
  } = movie

  const certColor = CERTIFICATE_COLORS[certificate] || 'bg-gray-700 text-gray-100'

  return (
    <Link
      to={`/movies/${_id}`}
      className="group block rounded-xl overflow-hidden bg-navy-800 border border-white/10 hover:border-primary-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary-900/30 hover:-translate-y-1"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden">
        {!imgError && posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary-900 via-navy-800 to-purple-900 flex items-center justify-center">
            <span className="text-6xl opacity-40">🎬</span>
          </div>
        )}

        {/* Certificate badge overlay */}
        {certificate && (
          <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded ${certColor}`}>
            {certificate}
          </span>
        )}

        {/* Status overlay */}
        {status === 'coming_soon' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-primary-600/90 px-3 py-1 rounded-full">
              Coming Soon
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <span className="text-white text-sm font-medium">View Details →</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-white font-semibold text-sm leading-tight truncate group-hover:text-primary-300 transition-colors">
          {title}
        </h3>

        {/* Genres */}
        <div className="flex flex-wrap gap-1 mt-2">
          {genres.slice(0, 2).map((g) => (
            <span key={g} className="text-xs bg-white/10 text-gray-300 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Tag size={9} />
              {g}
            </span>
          ))}
        </div>

        {/* Duration + Rating */}
        <div className="flex items-center justify-between mt-2.5 text-xs text-gray-400">
          {duration && (
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {Math.floor(duration / 60)}h {duration % 60}m
            </span>
          )}
          {rating > 0 && (
            <span className="flex items-center gap-1 text-yellow-400">
              <Star size={11} className="fill-yellow-400" />
              {Number(rating).toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
