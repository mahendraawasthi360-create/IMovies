import { useState, useEffect } from 'react'
import { Plus, Trash2, X, Check } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import api from '../../services/api.js'

const EMPTY_FORM = {
  movieId:'', theatreId:'', screenId:'', startTime:'', endTime:'',
  priceStandard:'150', pricePremium:'250', priceRecliner:'400',
}

export default function ManageShows() {
  const [shows,    setShows]    = useState([])
  const [movies,   setMovies]   = useState([])
  const [theatres, setTheatres] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(false)
  const [form,     setForm]     = useState(EMPTY_FORM)
  const [saving,   setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(null)

  const availScreens = theatres.find(t=>t._id===form.theatreId)?.screens || []

  const load = async () => {
    setLoading(true)
    try {
      const [sm, st] = await Promise.all([
        api.get('/movies', { params:{limit:100} }),
        api.get('/theatres'),
      ])
      setMovies(sm.data.data || [])
      setTheatres(st.data.data || [])

      // Fetch recent shows
      const showIds = []
      for (const m of (sm.data.data || []).slice(0,10)) {
        const { data } = await api.get(`/movies/${m._id}/shows`).catch(()=>({data:{data:[]}}))
        showIds.push(...(data.data||[]))
      }
      setShows(showIds.slice(0,50))
    } finally { setLoading(false) }
  }
  useEffect(load, [])

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.movieId||!form.theatreId||!form.screenId||!form.startTime||!form.endTime) return toast.error('All fields are required.')
    setSaving(true)
    try {
      await api.post('/shows', {
        movieId: form.movieId, theatreId: form.theatreId,
        screenId: form.screenId, startTime: form.startTime, endTime: form.endTime,
        priceTiers: { standard: Number(form.priceStandard), premium: Number(form.pricePremium), recliner: Number(form.priceRecliner) },
      })
      toast.success('Show created.'); setModal(false); load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create show.')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel/delete this show?')) return
    setDeleting(id)
    try {
      await api.delete(`/shows/${id}`)
      toast.success('Show deleted.')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed.') }
    finally { setDeleting(null) }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Shows</h2>
          <p className="text-gray-400 text-sm mt-1">Schedule movie shows</p>
        </div>
        <button onClick={()=>{setForm(EMPTY_FORM);setModal(true)}}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition">
          <Plus size={18}/> Add Show
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({length:5}).map((_,i)=><div key={i} className="h-16 bg-gray-900 rounded-xl animate-pulse border border-gray-800"/>)}</div>
      ) : (
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800">
              <tr className="text-left text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-4 py-3">Movie</th>
                <th className="px-4 py-3 hidden md:table-cell">Theatre</th>
                <th className="px-4 py-3">Start Time</th>
                <th className="px-4 py-3 hidden sm:table-cell">Seats</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {shows.map((s)=>(
                <tr key={s._id} className="hover:bg-gray-800/50 transition">
                  <td className="px-4 py-3 text-white">{s.movieId?.title||'—'}</td>
                  <td className="px-4 py-3 hidden md:table-cell text-gray-400">{s.theatreId?.name||'—'}</td>
                  <td className="px-4 py-3 text-gray-300">{s.startTime ? format(new Date(s.startTime),'dd MMM, hh:mm a') : '—'}</td>
                  <td className="px-4 py-3 hidden sm:table-cell text-gray-400">{s.seatStats?.totalSeats||s.seats?.length||0}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={()=>handleDelete(s._id)} disabled={deleting===s._id}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded transition disabled:opacity-50"><Trash2 size={16}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {shows.length===0 && <p className="text-center text-gray-500 py-10">No shows scheduled.</p>}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 sticky top-0 bg-gray-900">
              <h3 className="text-lg font-bold text-white">Add Show</h3>
              <button onClick={()=>setModal(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Movie *</label>
                <select value={form.movieId} onChange={(e)=>setForm({...form,movieId:e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm">
                  <option value="">Select movie</option>
                  {movies.map(m=><option key={m._id} value={m._id}>{m.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Theatre *</label>
                <select value={form.theatreId} onChange={(e)=>setForm({...form,theatreId:e.target.value,screenId:''})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm">
                  <option value="">Select theatre</option>
                  {theatres.map(t=><option key={t._id} value={t._id}>{t.name}, {t.city}</option>)}
                </select>
              </div>
              {availScreens.length > 0 && (
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Screen *</label>
                  <select value={form.screenId} onChange={(e)=>setForm({...form,screenId:e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm">
                    <option value="">Select screen</option>
                    {availScreens.map(s=><option key={s._id||s.name} value={s.name}>{s.name} ({s.rows}×{s.columns})</option>)}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Start Time *</label>
                  <input type="datetime-local" value={form.startTime} onChange={(e)=>setForm({...form,startTime:e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"/>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">End Time *</label>
                  <input type="datetime-local" value={form.endTime} onChange={(e)=>setForm({...form,endTime:e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"/>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-300 mb-2">Price Tiers (₹)</p>
                <div className="grid grid-cols-3 gap-2">
                  {[['Standard','priceStandard'],['Premium','pricePremium'],['Recliner','priceRecliner']].map(([l,k])=>(
                    <div key={k}>
                      <label className="block text-xs text-gray-500 mb-1">{l}</label>
                      <input type="number" value={form[k]} onChange={(e)=>setForm({...form,[k]:e.target.value})}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"/>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg transition disabled:opacity-50 font-medium">
                  <Check size={16}/> {saving ? 'Creating...' : 'Create Show'}
                </button>
                <button type="button" onClick={()=>setModal(false)}
                  className="px-5 py-2.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
