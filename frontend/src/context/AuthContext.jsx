import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Restore session on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('imovies_token')
    const storedUser = localStorage.getItem('imovies_user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        // corrupted storage
      }

      // Verify token is still valid by fetching profile
      api
        .get('/auth/profile')
        .then((res) => {
          setUser(res.data.user || res.data)
          localStorage.setItem('imovies_user', JSON.stringify(res.data.user || res.data))
        })
        .catch(() => {
          // Token invalid – clear everything
          localStorage.removeItem('imovies_token')
          localStorage.removeItem('imovies_user')
          setToken(null)
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback((newToken, newUser) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('imovies_token', newToken)
    localStorage.setItem('imovies_user', JSON.stringify(newUser))
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('imovies_token')
    localStorage.removeItem('imovies_user')
    navigate('/')
  }, [navigate])

  const isAuthenticated = Boolean(token && user)
  const isAdmin = isAuthenticated && (user?.role === 'admin' || user?.isAdmin === true)

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
