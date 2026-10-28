import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Ticket, Clock, MapPin, Calendar, XCircle, CheckCircle, AlertCircle } from 'lucide-react'
import { format, isFuture, isPast } from 'date-fns'
import toast from 'react-hot-toast'
import QRCode from 'react-qr-code'
import api from '../services/api.js'

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', color: 'text-green-400 bg-green-900/30', icon: CheckCircle },
  cancelled:  { label: 'Cancelled', color: 'text-red-400 bg-red-900/30',   icon: XCircle },
  pending:    { label: 'Pending',   color: 'text-yellow-400 bg-yellow-900/30', icon: AlertCircle },
}

const TABS = ['Upcoming', 'Past', 'Cancelled']

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Upcoming')
  const [cancelling, setCancelling] = useState(null)
  const [expanded, setExpanded] = useState(null)

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/bookings/me')
      setBookings(data.data || [])
    } catch {
      toast.error('Failed to load bookings.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBookings() }, [])

  const filteredBookings = bookings.filter((b) => {
    const showTime = b.showId?.startTime ? new Date(b.showId.startTime) : null
    if (activeTab === 'Upcoming') return b.status === 'confirmed' && showTime && isFuture(showTime)
    if (activeTab === 'Past')     return b.status === 'confirmed' && showTime && isPast(showTime)
    if (activeTab === 'Cancelled') return b.status === 'cancelled'
    return true
  })

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return
    setCancelling(bookingId)
    try {
      await api.patch(`/bookings/${bookingId}/cancel`)
      toast.success('Booking cancelled successfully.')
      fetchBookings()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed.')
    } finally {
      setCancelling(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
        <Ticket className="text-indigo-400" size={32} /> My Bookings
      </h1>
      <p className="text-gray-400 mb-8">Manage all your movie ticket reservations</p>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 p-1 rounded-xl mb-8 w-fit">
        {TABS.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-900 rounded-xl h-32 animate-pulse border border-gray-800" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-20">
          <Ticket size={64} className="mx-auto text-gray-700 mb-4" />
          <p className="text-gray-400 text-lg">No {activeTab.toLowerCase()} bookings found.</p>
          {activeTab === 'Upcoming' && (
            <Link to="/" className="mt-4 inline-block bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition">
              Browse Movies
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const show   = booking.showId
            const movie  = show?.movieId
            const theatre = show?.theatreId
            const cfg    = STATUS_CONFIG[booking.status] || STATUS_CONFIG.pending
            const Icon   = cfg.icon
            const isExpanded = expanded === booking._id

            return (
              <div key={booking._id}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition">
                {/* Header row */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Poster */}
                  {movie?.posterUrl ? (
                    <img src={movie.posterUrl} alt={movie.title}
                      className="w-16 h-24 object-cover rounded-lg flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-24 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Ticket size={24} className="text-gray-600" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-white truncate">{movie?.title || 'Unknown Movie'}</h3>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${cfg.color}`}>
                        <Icon size={12} /> {cfg.label}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-gray-400">
                      {show?.startTime && (
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-indigo-400" />
                          {format(new Date(show.startTime), 'EEEE, dd MMM yyyy')}
                          <Clock size={14} className="text-indigo-400 ml-2" />
                          {format(new Date(show.startTime), 'hh:mm a')}
                        </div>
                      )}
                      {theatre && (
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-indigo-400" />
                          {theatre.name}, {theatre.city}
                        </div>
                      )}
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-white font-semibold">
                          {booking.seats?.length} seat{booking.seats?.length !== 1 ? 's' : ''} •
                          ₹{booking.totalAmount?.toLocaleString()}
                        </span>
                        <span className="text-xs bg-gray-800 px-2 py-0.5 rounded font-mono text-gray-300">
                          {booking.bookingCode}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button onClick={() => setExpanded(isExpanded ? null : booking._id)}
                      className="text-sm text-indigo-400 hover:text-indigo-300 border border-indigo-800 px-3 py-1.5 rounded-lg transition">
                      {isExpanded ? 'Hide' : 'Details'}
                    </button>
                    {booking.status === 'confirmed' && show?.startTime && isFuture(new Date(new Date(show.startTime).getTime() - 2 * 60 * 60 * 1000)) && (
                      <button onClick={() => handleCancel(booking._id)} disabled={cancelling === booking._id}
                        className="text-sm text-red-400 hover:text-red-300 border border-red-900 px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                        {cancelling === booking._id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-gray-800 p-5 flex flex-col sm:flex-row gap-6">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Seat Details</h4>
                      <div className="flex flex-wrap gap-2">
                        {booking.seats?.map((s) => (
                          <span key={s.seatId}
                            className="px-3 py-1 bg-gray-800 text-white rounded-lg text-sm font-medium">
                            {s.seatId}
                            <span className="text-gray-400 text-xs ml-1 capitalize">({s.category})</span>
                            <span className="text-indigo-400 text-xs ml-1">₹{s.price}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                    {booking.bookingCode && (
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-xs text-gray-500">Scan at entrance</p>
                        <div className="bg-white p-3 rounded-xl">
                          <QRCode value={booking.bookingCode} size={100} />
                        </div>
                        <p className="text-xs font-mono text-gray-400">{booking.bookingCode}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
