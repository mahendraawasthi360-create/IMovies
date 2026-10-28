import { Link } from 'react-router-dom'
import { Film, Heart, Github, Twitter, Instagram } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-navy-800 border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🎬</span>
              <span className="text-xl font-bold text-white">iMovies</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your one-stop destination for booking movie tickets online. Fast, secure, and easy.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-gray-500 hover:text-primary-400 transition-colors"><Twitter size={18} /></a>
              <a href="#" className="text-gray-500 hover:text-primary-400 transition-colors"><Instagram size={18} /></a>
              <a href="#" className="text-gray-500 hover:text-primary-400 transition-colors"><Github size={18} /></a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Now Showing' },
                { to: '/my-bookings', label: 'My Bookings' },
                { to: '/login', label: 'Sign In' },
                { to: '/register', label: 'Create Account' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h3>
            <ul className="space-y-2">
              {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Refund Policy'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
          <p>© {year} iMovies. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart size={13} className="text-red-500 fill-red-500" /> for movie lovers
          </p>
        </div>
      </div>
    </footer>
  )
}
