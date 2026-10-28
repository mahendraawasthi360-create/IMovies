import { useEffect, useState } from 'react'
import { Clock, Info } from 'lucide-react'

const SEAT_STATUS = {
  available: 'seat seat-available',
  selected: 'seat seat-selected',
  held: 'seat seat-held',
  booked: 'seat seat-booked',
}

function formatCountdown(ms) {
  if (ms <= 0) return '0:00'
  const totalSecs = Math.floor(ms / 1000)
  const m = Math.floor(totalSecs / 60)
  const s = totalSecs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function SeatMap({
  seats = [],
  selectedSeats = [],
  onSeatClick,
  priceTiers = {},
  holdExpiresAt = null,
}) {
  const [countdown, setCountdown] = useState(null)

  // Countdown timer
  useEffect(() => {
    if (!holdExpiresAt) { setCountdown(null); return }
    const tick = () => {
      const remaining = new Date(holdExpiresAt).getTime() - Date.now()
      setCountdown(remaining > 0 ? remaining : 0)
    }
    tick()
    const interval = setInterval(tick, 500)
    return () => clearInterval(interval)
  }, [holdExpiresAt])

  // Group seats by row
  const rows = seats.reduce((acc, seat) => {
    const row = seat.row || seat.seatNumber?.[0] || '?'
    if (!acc[row]) acc[row] = []
    acc[row].push(seat)
    return acc
  }, {})

  const sortedRows = Object.keys(rows).sort()

  const getSeatStatus = (seat) => {
    if (selectedSeats.includes(seat._id)) return 'selected'
    if (seat.status === 'booked') return 'booked'
    if (seat.status === 'held') return 'held'
    return 'available'
  }

  const getSeatPrice = (seat) => {
    const tier = seat.type || 'standard'
    return priceTiers[tier] || 0
  }

  const totalPrice = selectedSeats.reduce((sum, seatId) => {
    const seat = seats.find((s) => s._id === seatId)
    return sum + (seat ? getSeatPrice(seat) : 0)
  }, 0)

  return (
    <div className="space-y-6">
      {/* Hold countdown */}
      {holdExpiresAt && countdown !== null && (
        <div className={`flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg ${
          countdown < 60000 ? 'bg-red-900/50 text-red-300 border border-red-700' : 'bg-yellow-900/50 text-yellow-300 border border-yellow-700'
        }`}>
          <Clock size={16} />
          Seats held for: {formatCountdown(countdown)}
          {countdown === 0 && ' – Hold expired!'}
        </div>
      )}

      {/* Screen indicator */}
      <div className="text-center">
        <div className="inline-block w-3/4 h-3 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full mb-1" />
        <p className="text-xs text-gray-500 tracking-widest uppercase">Screen</p>
      </div>

      {/* Seat grid */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-block min-w-full">
          {sortedRows.map((row) => (
            <div key={row} className="flex items-center gap-1.5 mb-1.5">
              <span className="w-6 text-xs text-gray-500 font-mono text-right shrink-0">{row}</span>
              <div className="flex gap-1.5 flex-wrap">
                {rows[row]
                  .sort((a, b) => (a.column || 0) - (b.column || 0))
                  .map((seat) => {
                    const status = getSeatStatus(seat)
                    const isClickable = status === 'available' || status === 'selected'
                    return (
                      <button
                        key={seat._id}
                        className={SEAT_STATUS[status]}
                        onClick={() => isClickable && onSeatClick && onSeatClick(seat)}
                        disabled={!isClickable}
                        title={`${seat.seatNumber || `${row}${seat.column}`} – ${seat.type || 'Standard'} – ₹${getSeatPrice(seat)}`}
                      >
                        <span className="text-[9px] leading-none">
                          {seat.column || seat.seatNumber?.slice(1)}
                        </span>
                      </button>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
        {[
          { cls: 'bg-green-500', label: 'Available' },
          { cls: 'bg-indigo-500', label: 'Selected' },
          { cls: 'bg-yellow-400', label: 'Held' },
          { cls: 'bg-red-500', label: 'Booked' },
        ].map(({ cls, label }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className={`w-4 h-4 rounded ${cls} inline-block`} />
            {label}
          </span>
        ))}
      </div>

      {/* Price tiers */}
      {Object.keys(priceTiers).length > 0 && (
        <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-400">
          {Object.entries(priceTiers).map(([tier, price]) => (
            <span key={tier} className="bg-white/5 border border-white/10 px-3 py-1 rounded-full capitalize">
              {tier}: ₹{price}
            </span>
          ))}
        </div>
      )}

      {/* Selected summary */}
      {selectedSeats.length > 0 && (
        <div className="card p-4 flex items-center justify-between">
          <div className="text-sm">
            <span className="text-gray-400">Selected: </span>
            <span className="text-white font-medium">
              {seats
                .filter((s) => selectedSeats.includes(s._id))
                .map((s) => s.seatNumber || `${s.row}${s.column}`)
                .join(', ')}
            </span>
          </div>
          <div className="text-lg font-bold text-primary-300">₹{totalPrice}</div>
        </div>
      )}
    </div>
  )
}
