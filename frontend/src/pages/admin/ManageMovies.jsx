import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api.js'

const GENRES = ['Action','Comedy','Drama','Horror','Romance','Sci-Fi','Thriller','Animation','Adventure','Mystery','Fantasy','Biography']
const CERTS  = ['U','UA','A','S']
const LANGS  = ['English','Hindi','Tamil','Telugu','Malayalam','Kannada','Bengali','Marathi']
const STATUSES = ['now_showing','coming_soon','ended']

const EMPTY_FORM = {
  title:'', description:'', genres:[], language:'English', duration:'',
  certificate:'UA', rating:'', posterUrl:'', trailerUrl:'',
  cast:'', releaseDate:'', status:'now_showing',
}

export default function ManageMovies() {
  const [movies, setMovies]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm]       = useState(EMPTY_FORM)
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/movies', { params: { limit: 100 } })
      .then(({ data }) => setMovies(data.data || []))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setModal(true) }
  const openEdit = (m) => {
    setEditing(m._id)
    setForm({
      title: m.title || '', description: m.description || '',
      genres: m.genres || [], language: m.language || 'English',
      duration: m.duration || '', certificate: m.certificate || 'UA',
      rating: m.rating || '', posterUrl: m.posterUrl || '',
      trailerUrl: m.trailerUrl || '',
      cast: (m.cast || []).map((c) => `${c.name}:${c.role}`).join('\n'),
      releaseDate: m.releaseDate ? m.releaseDate.substring(0, 10) : '',
      status: m.status || 'now_showing',
    })
    setModal(true)
  }

  const toggleGenre = (g) => setForm((f) => ({
    ...f, genres: f.genres.includes(g) ? f.genres.filter((x) => x !== g) : [...f.genres, g],
  }))

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title || !form.description || !form.duration) return toast.error('Title, description and duration are required.')
    setSaving(true)
    const payload = {
      ...form,
      duration: Number(form.duration),
      rating: form.rating ? Number(form.rating) : undefined,
      cast: form.cast
        ? form.cast.split('\n').filter(Boolean).map((line) => {
            const [name, role] = line.split(':')
            return { name: name?.trim(), role: role?.trim() || 'Cast' }
          })
        : [],
    }
    try {
      if (editing) {
        await api.put(`/movies/${editing}`, payload)
        toast.success('Movie updated.')
      } else {
        await api.post('/movies', payload)
        toast.success('Movie added.')
      }
      setModal(false); load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this movie?')) return
    setDeleting(id)
    try {
      await api.delete(`/movies/${id}`)
      toast.success('Movie deleted.')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Movies</h2>
          <p className="text-gray-400 text-sm mt-1">Manage your movie library</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition">
          <Plus size={18} /> Add Movie
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
                <th className="px-4 py-3 hidden md:table-cell">Genre</th>
                <th className="px-4 py-3 hidden sm:table-cell">Status</th>
                <th className="px-4 py-3 hidden lg:table-cell">Duration</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {movies.map((m) => (
                <tr key={m._id} className="hover:bg-gray-800/50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {m.posterUrl
                        ? <img src={m.posterUrl} alt={m.title} className="w-8 h-12 object-cover rounded"/>
                        : <div className="w-8 h-12 bg-gray-700 rounded"/>}
                      <div>
                        <p className="text-white font-medium">{m.title}</p>
                        <p className="text-gray-500 text-xs">{m.certificate} • {m.language}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(m.genres || []).slice(0,2).map((g)=>(
                        <span key={g} className="px-2 py-0.5 bg-indigo-900/40 text-indigo-300 text-xs rounded">{g}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${m.status==='now_showing'?'bg-green-900/40 text-green-400':m.status==='coming_soon'?'bg-yellow-900/40 text-yellow-400':'bg-gray-700 text-gray-400'}`}>
                      {m.status?.replace('_',' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-400">{m.duration} min</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => openEdit(m)} className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-gray-800 rounded transition"><Pencil size={16}/></button>
                      <button onClick={() => handleDelete(m._id)} disabled={deleting===m._id} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded transition disabled:opacity-50"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {movies.length === 0 && <p className="text-center text-gray-500 py-10">No movies yet. Add one!</p>}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 sticky top-0 bg-gray-900">
              <h3 className="text-lg font-bold text-white">{editing ? 'Edit Movie' : 'Add Movie'}</h3>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {[
                { label:'Title *', name:'title', type:'text' },
                { label:'Poster URL', name:'posterUrl', type:'url', placeholder:'https://...' },
                { label:'Trailer URL', name:'trailerUrl', type:'url', placeholder:'https://youtube.com/...' },
                { label:'Release Date', name:'releaseDate', type:'date' },
              ].map(({label,name,type,placeholder})=>(
                <div key={name}>
                  <label className="block text-sm text-gray-300 mb-1">{label}</label>
                  <input type={type} value={form[name]} onChange={(e)=>setForm({...form,[name]:e.target.value})}
                    placeholder={placeholder}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"/>
                </div>
              ))}

              <div>
                <label className="block text-sm text-gray-300 mb-1">Description *</label>
                <textarea rows={3} value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm resize-none"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Duration (min) *</label>
                  <input type="number" value={form.duration} onChange={(e)=>setForm({...form,duration:e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"/>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Rating (0–10)</label>
                  <input type="number" min="0" max="10" step="0.1" value={form.rating} onChange={(e)=>setForm({...form,rating:e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"/>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Certificate</label>
                  <select value={form.certificate} onChange={(e)=>setForm({...form,certificate:e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm">
                    {CERTS.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Language</label>
                  <select value={form.language} onChange={(e)=>setForm({...form,language:e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm">
                    {LANGS.map(l=><option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Status</label>
                  <select value={form.status} onChange={(e)=>setForm({...form,status:e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm">
                    {STATUSES.map(s=><option key={s} value={s}>{s.replace('_',' ')}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-2">Genres</label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map(g=>(
                    <button key={g} type="button" onClick={()=>toggleGenre(g)}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition ${form.genres.includes(g)?'bg-indigo-600 text-white':'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Cast (one per line: Name:Role)</label>
                <textarea rows={3} value={form.cast} onChange={(e)=>setForm({...form,cast:e.target.value})}
                  placeholder={"Shah Rukh Khan:Lead\nDeepika Padukone:Lead"}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm resize-none font-mono"/>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg transition disabled:opacity-50 font-medium">
                  <Check size={16}/> {saving ? 'Saving...' : (editing ? 'Update' : 'Add Movie')}
                </button>
                <button type="button" onClick={()=>setModal(false)}
                  className="px-5 py-2.5 rounded-lg border border-gray-700 text-gray-400 hover:text-white transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
