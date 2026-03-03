import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { invitationService } from '../services/invitationService'

const AcceptInvite = () => {
  const { token } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [propertyId, setPropertyId] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) {
      // Store the token in sessionStorage to use after login
      sessionStorage.setItem('inviteToken', token)
    }
  }, [token, isAuthenticated])

  const handleAcceptInvite = async () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate(`/login?redirect=/accept-invite/${token}`)
      return
    }

    if (user?.role !== 'TENANT') {
      setError('Only tenants can accept property invitations')
      return
    }

    try {
      setLoading(true)
      setError('')
      const response = await invitationService.joinWithToken(token)
      setPropertyId(response.data.propertyId)
      setSuccess(true)
      
      // Clear stored token
      sessionStorage.removeItem('inviteToken')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept invitation')
    } finally {
      setLoading(false)
    }
  }

  if (success && propertyId) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Invitation Accepted!
          </h1>
          <p className="text-gray-600 mb-6">
            You have successfully accepted the invitation for the property.
          </p>
          <Link to={`/properties/${propertyId}`} className="btn-primary">
            View Property
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🏠</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Property Invitation
          </h1>
          <p className="text-gray-600">
            {isAuthenticated
              ? 'Accept this invitation to be assigned to the property'
              : 'Please log in to accept this invitation'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {!isAuthenticated ? (
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              You need to be logged in as a tenant to accept this invitation.
            </p>
            <div className="flex space-x-4 justify-center">
              <Link to={`/login?redirect=/accept-invite/${token}`} className="btn-primary">
                Login
              </Link>
              <Link to={`/register?redirect=/accept-invite/${token}`} className="btn-secondary">
                Register
              </Link>
            </div>
          </div>
        ) : user?.role !== 'TENANT' ? (
          <div className="text-center">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
              Only tenants can accept property invitations. Your current role is: {user?.role}
            </div>
            <Link to="/properties" className="btn-primary">
              Go to Properties
            </Link>
          </div>
        ) : (
          <div className="text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <p className="text-blue-800 mb-2">
                <strong>Ready to accept?</strong>
              </p>
              <p className="text-blue-700 text-sm">
                By accepting this invitation, you will be assigned as the tenant for this property.
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleAcceptInvite}
                disabled={loading}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Accepting...' : 'Accept Invitation'}
              </button>
              <Link to="/properties" className="btn-secondary">
                Cancel
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AcceptInvite

