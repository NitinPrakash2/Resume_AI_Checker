import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import PageTransition from './components/PageTransition'
import Landing from './pages/Landing'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Result from './pages/Result'
import Jobs from './pages/Jobs'
import Interviews from './pages/Interviews'
import Benchmark from './pages/Benchmark'
import History from './pages/History'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  const location = useLocation()
  const isPublic = ['/', '/login', '/register'].includes(location.pathname)

  return (
    <>
      {isPublic ? (
        <PageTransition key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PageTransition>
      ) : (
        <Routes location={location}>
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/result/:id" element={<Result />} />
            <Route path="/result" element={<Result />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/interviews" element={<Interviews />} />
            <Route path="/benchmark" element={<Benchmark />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </>
  )
}
