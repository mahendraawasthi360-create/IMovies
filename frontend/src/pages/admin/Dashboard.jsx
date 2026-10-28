import { useState, useEffect } from 'react'
import { Film, CalendarDays, Ticket, DollarSign, TrendingUp, Users } from 'lucide-react'
import api from '../../services/api.js'

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm text-gray-400">{label}</p>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
    <p className="text-3xl font-bold text-white">{value ?? '—'}</p>
    {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
  </div>
)

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(({ data }) => setStats(data.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  const cards = [
    { icon: Film,        label: 'Total Movies',       value: stats?.totalMovies,    color: 'bg-indigo-600', sub: 'in library' },
    { icon: CalendarDays,label: "Today's Shows",       value: stats?.showsToday,     color: 'bg-purple-600', sub: 'scheduled today' },
    { icon: Ticket,      label: "Today's Bookings",    value: stats?.bookingsToday,  color: 'bg-emerald-600', sub: 'tickets sold' },
    { icon: DollarSign,  label: "Today's Revenue",     value: stats?.revenueToday != null ? `₹${stats.revenueToday.toLocaleString()}` : '—', color: 'bg-amber-600', sub: 'confirmed bookings' },
    { icon: Users,       label: 'Total Users',         value: stats?.totalUsers,     color: 'bg-cyan-600',   sub: 'registered' },
    { icon: TrendingUp,  label: 'Total Bookings',      value: stats?.totalBookings,  color: 'bg-rose-600',   sub: 'all time' },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">Dashboard</h2>
      <p className="text-gray-400 mb-8">Welcome back! Here's what's happening today.</p>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl h-32 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {cards.map((card) => <StatCard key={card.label} {...card} />)}
        </div>
      )}
    </div>
  )
}
