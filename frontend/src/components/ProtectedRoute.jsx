import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-indigo-500 border-t-transparent"></div>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default ProtectedRoute
