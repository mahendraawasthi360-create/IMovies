import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Film, Ticket, LayoutDashboard, LogIn, UserPlus, LogOut, Menu, X, User } from 'lucide-react'
import useAuth from '../hooks/useAuth'

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-primary-600/30 text-primary-300' : 'text-gray-300 hover:text-white hover:bg-white/10'
    }`

  const handleLogout = () => {
    setProfileOpen(false)
    setMenuOpen(false)
    logout()
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-900/95 backdrop-blur-sm border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🎬</span>
            <span className="text-xl font-bold text-white group-hover:text-primary-300 transition-colors">
              iMovies
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" end className={navLinkClass}>
              <Film size={16} />
              Movies
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/my-bookings" className={navLinkClass}>
                <Ticket size={16} />
                My Bookings
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin/dashboard" className={navLinkClass}>
                <LayoutDashboard size={16} />
                Admin
              </NavLink>
            )}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="max-w-[120px] truncate">{user?.name || 'User'}</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-navy-800 rounded-xl border border-white/10 shadow-2xl py-1 animate-fade-in">
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/my-bookings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10"
                    >
                      <Ticket size={14} />
                      My Bookings
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10"
                      >
                        <LayoutDashboard size={14} />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="btn-secondary !px-4 !py-1.5 !text-sm flex items-center gap-1.5">
                  <LogIn size={15} />
                  Login
                </Link>
                <Link to="/register" className="btn-primary !px-4 !py-1.5 !text-sm flex items-center gap-1.5">
                  <UserPlus size={15} />
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-navy-800 border-t border-white/10 px-4 py-4 space-y-2 animate-fade-in">
          <NavLink to="/" end className={navLinkClass} onClick={() => setMenuOpen(false)}>
            <Film size={16} />
            Movies
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/my-bookings" className={navLinkClass} onClick={() => setMenuOpen(false)}>
              <Ticket size={16} />
              My Bookings
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin/dashboard" className={navLinkClass} onClick={() => setMenuOpen(false)}>
              <LayoutDashboard size={16} />
              Admin Panel
            </NavLink>
          )}
          <div className="pt-2 border-t border-white/10">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400">
                  <User size={14} />
                  {user?.name}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-900/20 rounded-lg"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="flex-1 btn-secondary !px-4 !py-2 !text-sm text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex-1 btn-primary !px-4 !py-2 !text-sm text-center"
                  onClick={() => setMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
