import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Check, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../services/api.js'

const EMPTY_FORM = { name:'', city:'', address:'' }
const EMPTY_SCREEN = { name:'', rows:'10', columns:'10' }

export default function ManageTheatres() {
  const [theatres, setTheatres] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [screens, setScreens]   = useState([])
  const [newScreen, setNewScreen] = useState(EMPTY_SCREEN)
  const [saving, setSaving]     = useState(false)
  const [expanded, setExpanded] = useState(null)

  const load = () => {
    setLoading(true)
    api.get('/theatres')
      .then(({ data }) => setTheatres(data.data || []))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  const openAdd = () => {
    setEditing(null); setForm(EMPTY_FORM); setScreens([]); setModal(true)
  }
  const openEdit = (t) => {
    setEditing(t._id)
    setForm({ name: t.name||'', city: t.city||'', address: t.address||'' })
    setScreens(t.screens?.map(s=>({name:s.name,rows:s.rows,columns:s.columns})) || [])
    setModal(true)
  }

  const addScreen = () => {
    if (!newScreen.name) return toast.error('Screen name is required.')
    setScreens([...screens, { ...newScreen, rows: Number(newScreen.rows), columns: Number(newScreen.columns) }])
    setNewScreen(EMPTY_SCREEN)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name || !form.city || !form.address) return toast.error('All theatre fields are required.')
    setSaving(true)
    try {
      const payload = { ...form, screens }
      if (editing) { await api.put(`/theatres/${editing}`, payload); toast.success('Theatre updated.') }
      else { await api.post('/theatres', payload); toast.success('Theatre added.') }
      setModal(false); load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed.')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this theatre?')) return
    try {
      await api.delete(`/theatres/${id}`)
      toast.success('Theatre deleted.')
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Delete failed.') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Theatres</h2>
          <p className="text-gray-400 text-sm mt-1">Manage cinema locations and screens</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition">
          <Plus size={18}/> Add Theatre
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({length:3}).map((_,i)=><div key={i} className="h-20 bg-gray-900 rounded-xl animate-pulse border border-gray-800"/>)}</div>
      ) : (
        <div className="space-y-3">
          {theatres.map((t) => (
            <div key={t._id} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="flex items-center gap-4 p-5">
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{t.name}</h3>
                  <p className="text-gray-400 text-sm">{t.city} • {t.address}</p>
                  <p className="text-gray-500 text-xs mt-1">{t.screens?.length || 0} screen(s)</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setExpanded(expanded===t._id ? null : t._id)}
                    className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded transition">
                    {expanded===t._id ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                  </button>
                  <button onClick={()=>openEdit(t)} className="p-1.5 text-gray-400 hover:text-indigo-400 hover:bg-gray-800 rounded transition"><Pencil size={16}/></button>
                  <button onClick={()=>handleDelete(t._id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded transition"><Trash2 size={16}/></button>
                </div>
              </div>
              {expanded===t._id && t.screens?.length > 0 && (
                <div className="border-t border-gray-800 p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {t.screens.map((s)=>(
                      <div key={s._id||s.name} className="bg-gray-800 rounded-lg px-3 py-2">
                        <p className="text-white text-sm font-medium">{s.name}</p>
                        <p className="text-gray-400 text-xs">{s.rows}R × {s.columns}C = {s.rows*s.columns} seats</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {theatres.length === 0 && <p className="text-center text-gray-500 py-10">No theatres yet.</p>}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 sticky top-0 bg-gray-900">
              <h3 className="text-lg font-bold text-white">{editing ? 'Edit Theatre' : 'Add Theatre'}</h3>
              <button onClick={()=>setModal(false)} className="text-gray-400 hover:text-white"><X size={20}/></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {[{label:'Theatre Name *',name:'name'},{label:'City *',name:'city'},{label:'Address *',name:'address'}].map(({label,name})=>(
                <div key={name}>
                  <label className="block text-sm text-gray-300 mb-1">{label}</label>
                  <input value={form[name]} onChange={(e)=>setForm({...form,[name]:e.target.value})}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"/>
                </div>
              ))}

              <div>
                <p className="text-sm text-gray-300 mb-3 font-medium">Screens</p>
                <div className="space-y-2 mb-3">
                  {screens.map((s,i)=>(
                    <div key={i} className="flex items-center justify-between bg-gray-800 px-3 py-2 rounded-lg">
                      <span className="text-white text-sm">{s.name} — {s.rows}R × {s.columns}C</span>
                      <button type="button" onClick={()=>setScreens(screens.filter((_,j)=>j!==i))}
                        className="text-red-400 hover:text-red-300"><X size={14}/></button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input placeholder="Screen name" value={newScreen.name} onChange={(e)=>setNewScreen({...newScreen,name:e.target.value})}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"/>
                  <input type="number" placeholder="Rows" value={newScreen.rows} onChange={(e)=>setNewScreen({...newScreen,rows:e.target.value})}
                    className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"/>
                  <input type="number" placeholder="Cols" value={newScreen.columns} onChange={(e)=>setNewScreen({...newScreen,columns:e.target.value})}
                    className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"/>
                  <button type="button" onClick={addScreen}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg transition"><Plus size={16}/></button>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg transition disabled:opacity-50 font-medium">
                  <Check size={16}/> {saving ? 'Saving...' : (editing ? 'Update' : 'Add Theatre')}
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
