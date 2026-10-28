import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 4000,          // fail fast → triggers mock fallback in 4s not 10s
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor – attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('imovies_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor – handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('imovies_token')
      localStorage.removeItem('imovies_user')
      // Redirect to login (avoid circular import by using window)
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
