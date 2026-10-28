import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import api from '../../services/api.js'

const STATUS_COLORS = {
  confirmed: 'bg-green-900/40 text-green-400',
  cancelled:  'bg-red-900/40 text-red-400',
  pending:    'bg-yellow-900/40 text-yellow-400',
}

export default function ManageBookings() {
  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [page,     setPage]     = useState(1)
  const [total,    setTotal]    = useState(0)
  const LIMIT = 15

  const load = async (p=1) => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/bookings', { params:{page:p,limit:LIMIT} })
      setBookings(data.data || [])
      setTotal(data.pagination?.total || 0)
    } finally { setLoading(false) }
  }
  useEffect(()=>{ load(page) }, [page])

  const pages = Math.ceil(total/LIMIT)

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white">All Bookings</h2>
        <p className="text-gray-400 text-sm mt-1">{total} total bookings</p>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({length:8}).map((_,i)=><div key={i} className="h-14 bg-gray-900 rounded-xl animate-pulse border border-gray-800"/>)}</div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="border-b border-gray-800">
                <tr className="text-left text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3">Booking Code</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Movie</th>
                  <th className="px-4 py-3">Show Time</th>
                  <th className="px-4 py-3">Seats</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Booked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-800/50 transition">
                    <td className="px-4 py-3 font-mono text-indigo-300 text-xs">{b.bookingCode}</td>
                    <td className="px-4 py-3">
                      <p className="text-white">{b.userId?.name||'—'}</p>
                      <p className="text-gray-500 text-xs">{b.userId?.email||''}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{b.showId?.movieId?.title||'—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {b.showId?.startTime ? format(new Date(b.showId.startTime),'dd MMM yy, hh:mm a') : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-300">{b.seats?.length||0}</td>
                    <td className="px-4 py-3 text-white font-medium">₹{b.totalAmount?.toLocaleString()||0}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[b.status]||'text-gray-400'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {b.createdAt ? format(new Date(b.createdAt),'dd MMM yy') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {bookings.length===0 && <p className="text-center text-gray-500 py-10">No bookings found.</p>}
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({length:pages},(_,i)=>i+1).map(p=>(
            <button key={p} onClick={()=>setPage(p)}
              className={`w-9 h-9 rounded-lg font-medium transition text-sm ${p===page?'bg-indigo-600 text-white':'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
