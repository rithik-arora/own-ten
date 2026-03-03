import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Properties from './pages/Properties'
import AddProperty from './pages/AddProperty'
import PropertyDetails from './pages/PropertyDetails'
import AcceptInvite from './pages/AcceptInvite'
import Disputes from './pages/Disputes'
import CreateDispute from './pages/CreateDispute'
import DisputeDetails from './pages/DisputeDetails'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'
import AdminDashboard from './pages/AdminDashboard'
import OwnerDashboard from './pages/OwnerDashboard'

/* 🔥 ADD THESE */
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />

              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />

              {/* 🔥 NEW ROUTES */}
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route path="reset-password/:token" element={<ResetPassword />} />

              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="owner-dashboard"
                element={
                  <ProtectedRoute>
                    <OwnerDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="properties"
                element={
                  <ProtectedRoute>
                    <Properties />
                  </ProtectedRoute>
                }
              />

              <Route
                path="properties/new"
                element={
                  <ProtectedRoute>
                    <AddProperty />
                  </ProtectedRoute>
                }
              />

              <Route
                path="properties/:id"
                element={
                  <ProtectedRoute>
                    <PropertyDetails />
                  </ProtectedRoute>
                }
              />

              <Route path="accept-invite/:token" element={<AcceptInvite />} />

              <Route
                path="disputes"
                element={
                  <ProtectedRoute>
                    <Disputes />
                  </ProtectedRoute>
                }
              />

              <Route
                path="disputes/new"
                element={
                  <ProtectedRoute>
                    <CreateDispute />
                  </ProtectedRoute>
                }
              />

              <Route
                path="disputes/:id"
                element={
                  <ProtectedRoute>
                    <DisputeDetails />
                  </ProtectedRoute>
                }
              />

              <Route
                path="admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App