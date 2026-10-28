import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { CheckCircle, Clock, MapPin, Ticket, Home, List } from 'lucide-react'
import QRCode from 'react-qr-code'
import api from '../services/api'
import { CardSkeleton } from '../components/LoadingSkeleton'

export default function BookingConfirmation() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get(`/bookings/${id}`)
      .then((res) => setBooking(res.data.booking || res.data))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-28 space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  if (!booking) return null

  const { bookingCode, movie, show, seats = [], totalAmount, status } = booking
  const startTime = show?.startTime ? new Date(show.startTime) : null
  const theatre = show?.theatre || {}
  const seatLabels = seats.map((s) => s.seatNumber || s.seat?.seatNumber).filter(Boolean).join(', ')

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Success header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="w-20 h-20 rounded-full bg-green-900/40 border-2 border-green-500 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={40} className="text-green-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-white">Booking Confirmed!</h1>
          <p className="text-gray-400 mt-2">Your tickets are ready. Have a great movie experience!</p>
        </div>

        {/* Ticket card */}
        <div className="card overflow-hidden animate-fade-in">
          {/* Top: Movie info */}
          <div className="flex gap-4 p-5 border-b border-white/10">
            {movie?.posterUrl && (
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-20 h-28 object-cover rounded-lg shrink-0"
              />
            )}
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{movie?.title}</h2>
              {movie?.language && (
                <p className="text-sm text-gray-400 mt-0.5">{movie.language}</p>
              )}
              <div className="mt-3 space-y-1.5 text-sm text-gray-300">
                {startTime && (
                  <div className="flex items-center gap-2">
                    <Clock size={13} className="text-primary-400" />
                    {format(startTime, 'EEEE, dd MMMM yyyy')} · {format(startTime, 'hh:mm a')}
                  </div>
                )}
                {theatre.name && (
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-primary-400" />
                    {theatre.name}{theatre.city && `, ${theatre.city}`}
                  </div>
                )}
                {show?.screen?.name && (
                  <p className="text-xs text-gray-500">Screen: {show.screen.name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Ticket tear line */}
          <div className="relative flex items-center">
            <div className="w-6 h-6 rounded-full bg-navy-900 -ml-3 shrink-0" />
            <div className="flex-1 border-t-2 border-dashed border-white/10 mx-2" />
            <div className="w-6 h-6 rounded-full bg-navy-900 -mr-3 shrink-0" />
          </div>

          {/* Bottom: Seat and code info */}
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Seats</p>
                <p className="text-white font-semibold mt-1 flex items-center gap-1.5">
                  <Ticket size={14} className="text-primary-400" />
                  {seatLabels || `${seats.length} Seat(s)`}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Total Paid</p>
                <p className="text-2xl font-extrabold text-primary-300 mt-1">₹{totalAmount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                <span className="badge-green mt-1 inline-flex">
                  <CheckCircle size={11} />
                  {status || 'Confirmed'}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider">Booking Code</p>
                <p className="font-mono text-lg font-bold text-white mt-1 tracking-widest">{bookingCode}</p>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="bg-white p-3 rounded-xl">
                <QRCode
                  value={bookingCode || id}
                  size={140}
                  bgColor="#ffffff"
                  fgColor="#1e1b4b"
                />
              </div>
              <p className="text-xs text-gray-500">Show at entrance</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Link to="/" className="btn-secondary flex items-center justify-center gap-2 flex-1">
            <Home size={16} />
            Back to Home
          </Link>
          <Link to="/my-bookings" className="btn-primary flex items-center justify-center gap-2 flex-1">
            <List size={16} />
            View My Bookings
          </Link>
        </div>
      </div>
    </div>
  )
}
