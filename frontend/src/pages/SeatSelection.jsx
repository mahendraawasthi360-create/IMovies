import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ChevronLeft, Clock, MapPin, AlertTriangle, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'
import { getSocket, joinShowRoom, leaveShowRoom } from '../services/socket'
import SeatMap from '../components/SeatMap'
import useAuth from '../hooks/useAuth'
import { MOCK_SHOWS } from '../data/mockData'
import { generateMockSeats } from '../data/mockSeats'

const MAX_SEATS = 10

export default function SeatSelection() {
  const { showId }   = useParams()
  const navigate     = useNavigate()
  const { isAuthenticated } = useAuth()

  const [show,          setShow]          = useState(null)
  const [seats,         setSeats]         = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])
  const [holdExpiresAt, setHoldExpiresAt] = useState(null)
  const [held,          setHeld]          = useState(false)
  const [loading,       setLoading]       = useState(true)
  const [holding,       setHolding]       = useState(false)
  const [booking,       setBooking]       = useState(false)
  const [isMock,        setIsMock]        = useState(false)

  // ── Live seat refresh ──────────────────────────────────────────────────────
  const fetchSeats = useCallback(async () => {
    try {
      const res = await api.get(`/shows/${showId}/seats`)
      setSeats(res.data.data || res.data.seats || res.data || [])
    } catch { /* silent */ }
  }, [showId])

  // ── Main data load ─────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      // Check if this is a mock show ID first
      const mockShow = MOCK_SHOWS.find((s) => s._id === showId)
      if (mockShow) {
        setShow(mockShow)
        setSeats(generateMockSeats(showId))
        setIsMock(true)
        setLoading(false)
        return
      }

      // Try live API
      try {
        const res = await api.get(`/shows/${showId}`)
        setShow(res.data.data || res.data.show || res.data)
        await fetchSeats()
      } catch {
        toast.error('Show not found')
        navigate('/')
        return
      } finally {
        setLoading(false)
      }

      // Socket.IO for real-time updates
      const socket = getSocket()
      joinShowRoom(showId)
      socket.on('seats:updated', fetchSeats)
      return () => {
        leaveShowRoom(showId)
        socket.off('seats:updated', fetchSeats)
      }
    }
    load()
  }, [showId])

  // ── Seat click ─────────────────────────────────────────────────────────────
  const handleSeatClick = (seat) => {
    if (held) {
      toast('Seats already held — complete your booking below.', { icon: 'ℹ️' })
      return
    }
    setSelectedSeats((prev) => {
      if (prev.includes(seat.seatId)) return prev.filter((id) => id !== seat.seatId)
      if (prev.length >= MAX_SEATS) {
        toast.error(`Maximum ${MAX_SEATS} seats per booking`)
        return prev
      }
      return [...prev, seat.seatId]
    })
  }

  // ── Hold seats ─────────────────────────────────────────────────────────────
  const handleHold = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to book tickets')
      navigate('/login')
      return
    }
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat')
      return
    }

    // Mock mode — simulate hold locally
    if (isMock) {
      const expiry = new Date(Date.now() + 5 * 60 * 1000)
      setHoldExpiresAt(expiry.toISOString())
      setHeld(true)
      setSeats((prev) =>
        prev.map((s) =>
          selectedSeats.includes(s.seatId)
            ? { ...s, status: 'held', heldBy: 'me', holdExpiresAt: expiry.toISOString() }
            : s
        )
      )
      toast.success('Seats held for 5 minutes! (Demo mode)')
      return
    }

    setHolding(true)
    try {
      const res = await api.post(`/shows/${showId}/hold`, { seatIds: selectedSeats })
      setHoldExpiresAt(res.data.holdExpiresAt || res.data.expiresAt)
      setHeld(true)
      toast.success('Seats held for 5 minutes! Complete your booking.')
      await fetchSeats()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to hold seats')
    } finally {
      setHolding(false)
    }
  }

  // ── Confirm booking ────────────────────────────────────────────────────────
  const handleConfirmBooking = async () => {
    if (isMock) {
      toast('🎭 Demo mode — connect to the backend to confirm real bookings.', { icon: 'ℹ️', duration: 4000 })
      return
    }
    setBooking(true)
    try {
      const res = await api.post('/bookings', { showId, seats: selectedSeats.map((id) => ({ seatId: id })) })
      const bookingId = res.data.data?._id || res.data.booking?._id || res.data._id
      toast.success('🎟️ Booking confirmed!')
      navigate(`/bookings/${bookingId}/confirmation`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Please try again.')
    } finally {
      setBooking(false)
    }
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ── Derived display values ─────────────────────────────────────────────────
  const movieObj   = show?.movieId   || show?.movie   || {}
  const theatreObj = show?.theatreId || show?.theatre || {}
  const priceTiers = show?.priceTiers || {}
  const startTime  = show?.startTime  ? new Date(show.startTime) : null

  // Total price of selected seats
  const totalPrice = selectedSeats.reduce((sum, seatId) => {
    const seat = seats.find((s) => s.seatId === seatId)
    return sum + (seat ? (priceTiers[seat.category] || 0) : 0)
  }, 0)

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Demo banner */}
        {isMock && (
          <div className="flex items-center gap-2 bg-indigo-900/50 border border-indigo-700/50 text-indigo-200 text-sm px-4 py-3 rounded-xl mb-6">
            <Info size={16} className="shrink-0 text-indigo-400" />
            <span><strong>Demo mode</strong> — seat map is simulated. Start MongoDB + backend to make real bookings.</span>
          </div>
        )}

        {/* Back */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white mb-6 transition-colors text-sm">
          <ChevronLeft size={18} /> Back
        </button>

        {/* ── Show info card ──────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          {movieObj.posterUrl && (
            <img src={movieObj.posterUrl} alt={movieObj.title}
              className="w-14 h-20 object-cover rounded-xl shrink-0 shadow-lg" />
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-white truncate">{movieObj.title || 'Movie'}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-400">
              {startTime && (
                <span className="flex items-center gap-1.5">
                  <Clock size={13} className="text-indigo-400" />
                  {format(startTime, 'EEE, dd MMM yyyy')} at {format(startTime, 'hh:mm a')}
                </span>
              )}
              {theatreObj.name && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-indigo-400" />
                  {theatreObj.name}{theatreObj.city ? `, ${theatreObj.city}` : ''}
                </span>
              )}
            </div>
          </div>

          {/* Price summary */}
          {selectedSeats.length > 0 && (
            <div className="shrink-0 bg-indigo-900/40 border border-indigo-700/50 rounded-xl px-4 py-3 text-right">
              <p className="text-xs text-gray-400">{selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}</p>
              <p className="text-xl font-bold text-white">₹{totalPrice.toLocaleString()}</p>
            </div>
          )}
        </div>

        {/* Max seats warning */}
        {selectedSeats.length === MAX_SEATS && (
          <div className="flex items-center gap-2 bg-yellow-900/30 border border-yellow-700/50 text-yellow-300 text-sm px-4 py-3 rounded-xl mb-4">
            <AlertTriangle size={15} className="shrink-0" />
            Maximum {MAX_SEATS} seats allowed per booking
          </div>
        )}

        {/* ── Seat Map ───────────────────────────────────────────── */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
          <SeatMap
            seats={seats}
            selectedSeats={selectedSeats}
            onSeatClick={handleSeatClick}
            priceTiers={priceTiers}
            holdExpiresAt={holdExpiresAt}
          />
        </div>

        {/* ── Action Buttons ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          {!held ? (
            <button
              onClick={handleHold}
              disabled={selectedSeats.length === 0 || holding}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl transition"
            >
              {holding ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Holding...</>
              ) : (
                `Hold ${selectedSeats.length > 0 ? selectedSeats.length : ''} Seat${selectedSeats.length !== 1 ? 's' : ''}`
              )}
            </button>
          ) : (
            <button
              onClick={handleConfirmBooking}
              disabled={booking}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-8 py-3 rounded-xl transition shadow-lg shadow-green-900/40"
            >
              {booking ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Confirming...</>
              ) : (
                '🎟️ Confirm Booking'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
