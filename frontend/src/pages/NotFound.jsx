import { Link } from 'react-router-dom'
import { Film, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-center px-4">
      <div>
        <div className="text-8xl font-extrabold text-indigo-600 mb-4">404</div>
        <Film size={64} className="mx-auto text-gray-700 mb-6" />
        <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
        <p className="text-gray-400 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-lg transition">
          <Home size={18} /> Back to Home
        </Link>
      </div>
    </div>
  )
}
