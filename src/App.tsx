import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Splash } from './pages/Splash'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { UserDashboard } from './pages/UserDashboard'
import { OfficerDashboard } from './pages/OfficerDashboard'
import { ShareMap } from './pages/ShareMap'
import { AuthProvider } from './contexts/AuthContext'
import 'leaflet/dist/leaflet.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/landing" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard/user" element={<UserDashboard />} />
            <Route path="/dashboard/officer" element={<OfficerDashboard />} />
            <Route path="/share/:token" element={<ShareMap />} />
          </Routes>
        </AnimatePresence>
      </Router>
    </AuthProvider>
  )
}

export default App