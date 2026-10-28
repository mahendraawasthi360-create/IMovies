import { useState, useMemo } from 'react'
import { format, isSameDay, addDays, startOfToday } from 'date-fns'
import { MapPin, Clock, Users } from 'lucide-react'

export default function ShowtimeSelector({ shows = [], onSelectShow }) {
  const [selectedDate, setSelectedDate] = useState(startOfToday())

  const dates = useMemo(() => {
    const out = []
    for (let i = 0; i < 7; i++) out.push(addDays(startOfToday(), i))
    return out
  }, [])

  const hasShows = (date) =>
    shows.some((s) => isSameDay(new Date(s.startTime), date))

  // Filter for selected date
  const filteredShows = useMemo(() =>
    shows.filter((s) => isSameDay(new Date(s.startTime), selectedDate)),
    [shows, selectedDate])

  // Group by theatre — handle both API shape (show.theatreId) and mock shape (show.theatre)
  const byTheatre = useMemo(() => {
    return filteredShows.reduce((acc, show) => {
      const theatreObj = show.theatreId || show.theatre || {}
      const name = theatreObj.name || 'Unknown Theatre'
      const city = theatreObj.city || ''
      const key  = `${name}||${city}`
      if (!acc[key]) acc[key] = { name, city, shows: [] }
      acc[key].shows.push(show)
      return acc
    }, {})
  }, [filteredShows])

  return (
    <div className="space-y-4">
      {/* ── Date Tabs ── */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {dates.map((date) => {
          const active    = isSameDay(date, selectedDate)
          const available = hasShows(date)
          return (
            <button
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              disabled={!available}
              className={`shrink-0 flex flex-col items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
                  : available
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700'
                  : 'bg-gray-900 text-gray-600 cursor-not-allowed border border-gray-800'
              }`}
            >
              <span className="text-xs opacity-70">{format(date, 'EEE')}</span>
              <span className="text-lg font-bold">{format(date, 'd')}</span>
              <span className="text-xs opacity-70">{format(date, 'MMM')}</span>
            </button>
          )
        })}
      </div>

      {/* ── Shows by Theatre ── */}
      {Object.keys(byTheatre).length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm">
            No shows available on {format(selectedDate, 'MMMM d, yyyy')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.values(byTheatre).map(({ name, city, shows: theatreShows }) => (
            <div key={`${name}-${city}`}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition">
              {/* Theatre header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-indigo-900/50 rounded-lg">
                  <MapPin size={14} className="text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">{name}</h4>
                  {city && <p className="text-xs text-gray-400">{city}</p>}
                </div>
              </div>

              {/* Showtime chips */}
              <div className="flex flex-wrap gap-2">
                {[...theatreShows]
                  .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                  .map((show) => {
                    const time   = new Date(show.startTime)
                    const isPast = time < new Date()
                    const avail  = show.seatStats?.availableSeats
                    return (
                      <button
                        key={show._id}
                        onClick={() => !isPast && onSelectShow?.(show)}
                        disabled={isPast}
                        className={`flex flex-col items-start px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                          isPast
                            ? 'border-gray-800 text-gray-600 bg-gray-900 cursor-not-allowed'
                            : 'border-indigo-500/50 text-indigo-300 bg-indigo-900/20 hover:bg-indigo-900/40 hover:border-indigo-400 hover:shadow-md hover:shadow-indigo-900/30'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Clock size={13} />
                          {format(time, 'hh:mm a')}
                        </span>
                        <span className="text-xs text-gray-500 mt-0.5">
                          {show.screenId || show.screen?.name || ''}
                        </span>
                        {avail != null && (
                          <span className={`text-xs mt-0.5 flex items-center gap-1 ${
                            avail < 20 ? 'text-red-400' : 'text-green-400'
                          }`}>
                            <Users size={10} />
                            {avail} seats left
                          </span>
                        )}
                        {/* Price from lowest tier */}
                        {show.priceTiers?.standard && (
                          <span className="text-xs text-gray-500 mt-0.5">
                            from ₹{Math.min(...Object.values(show.priceTiers).filter(Boolean))}
                          </span>
                        )}
                      </button>
                    )
                  })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
