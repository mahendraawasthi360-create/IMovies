import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Phone, Eye, EyeOff, Film } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api.js'
import useAuth from '../hooks/useAuth.js'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirmPassword: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone || !form.password) return toast.error('Please fill in all fields.')
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match.')
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters.')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/register', {
        name: form.name, email: form.email, phone: form.phone, password: form.password,
      })
      login(data.token, data.user)
      toast.success('Account created successfully!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { label: 'Full Name', name: 'name', type: 'text', icon: User, placeholder: 'John Doe' },
    { label: 'Email', name: 'email', type: 'email', icon: Mail, placeholder: 'you@example.com' },
    { label: 'Phone', name: 'phone', type: 'tel', icon: Phone, placeholder: '+91 98765 43210' },
  ]

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-indigo-400 text-3xl font-bold">
            <Film size={36} /> IMovies
          </Link>
          <p className="text-gray-400 mt-2">Create your account</p>
        </div>

        <div className="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ label, name, type, icon: Icon, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type={type} name={name} value={form[name]} onChange={handleChange}
                    placeholder={placeholder}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>
            ))}

            {['password', 'confirmPassword'].map((name) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {name === 'password' ? 'Password' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input
                    type={showPw ? 'text' : 'password'} name={name} value={form[name]} onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-10 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                  {name === 'confirmPassword' && (
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition mt-2">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
