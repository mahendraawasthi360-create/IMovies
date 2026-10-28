import { useState } from 'react'
import { format } from 'date-fns'
import { MapPin, Clock, Ticket, XCircle, CheckCircle, AlertCircle } from 'lucide-react'
import QRCode from 'react-qr-code'
import toast from 'react-hot-toast'
import api from '../services/api'

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', cls: 'badge-green', icon: CheckCircle },
  cancelled: { label: 'Cancelled', cls: 'badge-red', icon: XCircle },
  pending: { label: 'Pending', cls: 'badge-yellow', icon: AlertCircle },
  used: { label: 'Used', cls: 'badge-gray', icon: Ticket },
}

export default function BookingCard({ booking, onCancelled }) {
  const [cancelling, setCancelling] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const {
    _id,
    bookingCode,
    movie,
    show,
    seats = [],
    totalAmount,
    status,
  } = booking

  const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  const StatusIcon = statusCfg.icon

  const showTime = show?.startTime ? new Date(show.startTime) : null
  const isUpcoming = showTime && showTime > new Date() && status === 'confirmed'

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this booking? Refunds may apply.')) return
    setCancelling(true)
    try {
      await api.delete(`/bookings/${_id}`)
      toast.success('Booking cancelled successfully')
      onCancelled?.(_id)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel booking')
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="card overflow-hidden hover:border-white/20 transition-colors">
      <div className="flex flex-col sm:flex-row">
        {/* Poster */}
        <div className="sm:w-28 shrink-0">
          {movie?.posterUrl ? (
            <img
              src={movie.posterUrl}
              alt={movie.title}
              className="w-full h-40 sm:h-full object-cover"
            />
          ) : (
            <div className="w-full h-40 sm:h-full bg-gradient-to-br from-primary-900 to-purple-900 flex items-center justify-center">
              <span className="text-4xl">🎬</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-white text-base leading-tight">{movie?.title || 'Movie'}</h3>
              {movie?.language && (
                <p className="text-xs text-gray-500 mt-0.5">{movie.language}</p>
              )}
            </div>
            <span className={`${statusCfg.cls} shrink-0 flex items-center gap-1`}>
              <StatusIcon size={11} />
              {statusCfg.label}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-400">
            {showTime && (
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-primary-400" />
                {format(showTime, 'EEE, dd MMM yyyy')} at {format(showTime, 'hh:mm a')}
              </span>
            )}
            {show?.theatre?.name && (
              <span className="flex items-center gap-1.5">
                <MapPin size={13} className="text-primary-400" />
                {show.theatre.name}
                {show.theatre.city && `, ${show.theatre.city}`}
              </span>
            )}
            {seats.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Ticket size={13} className="text-primary-400" />
                {seats.map((s) => s.seatNumber || s.seat?.seatNumber).join(', ')}
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Booking Code</p>
              <p className="font-mono font-bold text-white text-sm">{bookingCode}</p>
            </div>
            <p className="text-lg font-bold text-primary-300">₹{totalAmount}</p>
          </div>

          {/* Actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setShowQR(!showQR)}
              className="text-xs btn-secondary !px-3 !py-1.5"
            >
              {showQR ? 'Hide QR' : 'Show QR'}
            </button>
            {isUpcoming && (
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="text-xs btn-danger !px-3 !py-1.5"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            )}
          </div>

          {/* QR Code */}
          {showQR && (
            <div className="mt-4 flex justify-center p-4 bg-white rounded-xl inline-flex">
              <QRCode
                value={bookingCode || _id}
                size={128}
                bgColor="#ffffff"
                fgColor="#1e1b4b"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
