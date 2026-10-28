import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AdminRoute from './components/AdminRoute.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'

import Home from './pages/Home.jsx'
import MovieDetail from './pages/MovieDetail.jsx'
import SeatSelection from './pages/SeatSelection.jsx'
import BookingConfirmation from './pages/BookingConfirmation.jsx'
import MyBookings from './pages/MyBookings.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import NotFound from './pages/NotFound.jsx'

import AdminLayout from './pages/admin/AdminLayout.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import ManageMovies from './pages/admin/ManageMovies.jsx'
import ManageTheatres from './pages/admin/ManageTheatres.jsx'
import ManageShows from './pages/admin/ManageShows.jsx'
import ManageBookings from './pages/admin/ManageBookings.jsx'

function WithLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-950">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
            success: { iconTheme: { primary: '#6366f1', secondary: '#fff' } },
          }}
        />
        <Routes>
          <Route path="/" element={<WithLayout><Home /></WithLayout>} />
          <Route path="/movies/:id" element={<WithLayout><MovieDetail /></WithLayout>} />
          <Route path="/shows/:showId/seats" element={<WithLayout><SeatSelection /></WithLayout>} />

          <Route path="/bookings/:id/confirmation" element={
            <ProtectedRoute>
              <WithLayout><BookingConfirmation /></WithLayout>
            </ProtectedRoute>
          } />

          <Route path="/my-bookings" element={
            <ProtectedRoute>
              <WithLayout><MyBookings /></WithLayout>
            </ProtectedRoute>
          } />

          <Route path="/login" element={<div className="min-h-screen bg-gray-950"><Login /></div>} />
          <Route path="/register" element={<div className="min-h-screen bg-gray-950"><Register /></div>} />

          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="movies" element={<ManageMovies />} />
            <Route path="theatres" element={<ManageTheatres />} />
            <Route path="shows" element={<ManageShows />} />
            <Route path="bookings" element={<ManageBookings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
