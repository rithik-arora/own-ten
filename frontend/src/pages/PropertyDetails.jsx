import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { propertyService } from '../services/propertyService'
import { joinRequestService } from '../services/joinRequestService'
import PayRentButton from '../components/PayRentButton'
import PropertyImageSlider from '../components/PropertyImageSlider'
import axios from 'axios'
import toast from 'react-hot-toast'
import InviteTenant from '../components/InviteTenant'
import {
  Home,
  MapPin,
  DollarSign,
  User,
  CheckCircle,
  XCircle,
  Upload,
  LogOut,
  UserPlus,
  AlertCircle
} from 'lucide-react'

const PropertyDetails = () => {
  const { id } = useParams()
  const { user } = useAuth()

  const [property, setProperty] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [showInviteModal,setShowInviteModal]=useState(false)

  useEffect(() => {
    loadProperty()
  }, [id])

  const loadProperty = async () => {
    try {
      setLoading(true)
      const res = await propertyService.getProperty(id)
      setProperty(res.data.property)

      if (user?.role === 'OWNER') {
        const reqRes = await joinRequestService.getPropertyJoinRequests(id)
        setRequests(reqRes.data.requests || [])
      }
    } catch {
      toast.error('Failed to load property')
    } finally {
      setLoading(false)
    }
  }

  const uploadImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setImageUploading(true)
      const formData = new FormData()
      formData.append('image', file)

      await propertyService.uploadPropertyImage(id, formData)

      toast.success('Image uploaded')
      loadProperty()
    } catch {
      toast.error('Upload failed')
    } finally {
      setImageUploading(false)
    }
  }

  const sendRequest = async () => {
    try {
      setSending(true)
      await joinRequestService.createJoinRequest(id)
      toast.success('Request sent')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Request failed')
    } finally {
      setSending(false)
    }
  }

  const approve = async (requestId) => {
    await joinRequestService.approveJoinRequest(requestId)
    toast.success('Approved')
    loadProperty()
  }

  const reject = async (requestId) => {
    await joinRequestService.rejectJoinRequest(requestId)
    toast.success('Rejected')
    loadProperty()
  }

  const removeTenant = async () => {
    if (!window.confirm('Remove tenant?')) return
    await axios.post(`/api/properties/${id}/remove-tenant`)
    toast.success('Tenant removed')
    loadProperty()
  }

  const leaveProperty = async () => {
    if (!window.confirm('Leave property?')) return
    await axios.post(`/api/properties/${id}/leave`)
    toast.success('Left property')
    loadProperty()
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-zinc-400">Property not found</div>
      </div>
    )
  }

  const isTenantHere =
    property.tenantId && property.tenantId._id === user?.id

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Subtle noise texture */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBudW1PY3RhdmVzPSIzIiAvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNmKSIgb3BhY2l0eT0iMC4wNCIgLz48L3N2Zz4=')] opacity-20 pointer-events-none"></div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto relative z-10"
      >
        {/* Main Property Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
          {/* Image Slider */}
          {property.images?.length > 0 && (
            <div className="relative">
              <PropertyImageSlider images={property.images} />
            </div>
          )}

          {/* Owner Image Upload */}
          {user?.role === 'OWNER' && (
            <div className="p-5 border-b border-zinc-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="file"
                  onChange={uploadImage}
                  disabled={imageUploading}
                  className="hidden"
                />
                <div className={`flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors ${imageUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <Upload size={18} />
                  {imageUploading ? 'Uploading...' : 'Upload Image'}
                </div>
              </label>
            </div>
          )}

          {/* Property Details */}
          <div className="p-6 space-y-4">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{property.address}</h1>
            {/* Property Status Badge */}
<div className="mt-2">
  <span
    className={`px-3 py-1 text-xs font-medium rounded-full border ${
      property.status === 'AVAILABLE'
        ? 'bg-green-600/20 text-green-400 border-green-500/30'
        : 'bg-indigo-600/20 text-indigo-400 border-indigo-500/30'
    }`}
  >
    {property.status}
  </span>
</div>
            <div className="flex items-center gap-2 text-zinc-400">
              <MapPin size={18} className="text-indigo-400" />
              <p>{property.city}, {property.state}</p>
            </div>
            <div className="flex items-center gap-2">
              
              <p className="text-2xl font-bold text-indigo-400">
                ₹{property.rentAmount.toLocaleString()}
                <span className="text-sm font-normal text-zinc-500 ml-1">/month</span>
              </p>
            </div>

            {/* Owner Info */}
{/* {property.ownerId && (
  <div className="flex items-center gap-2 text-zinc-400 mt-2">
    <User size={18} className="text-indigo-400" />
    <div>
      <p className="text-sm">Owner</p>
      <p className="text-white font-medium">
        {property.ownerId.name}
      </p>
    </div>
  </div>
)} */}


            {/* Owner Info */}
{property.ownerId && (
  <div className="mt-4 p-4 bg-zinc-800 rounded-xl border border-zinc-700">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center">
        <User size={18} className="text-indigo-400" />
      </div>
      <div>
        <p className="text-xs text-zinc-400 uppercase tracking-wide">
          Property Owner
        </p>
        <p className="text-white font-semibold">
          {property.ownerId.name}
        </p>
        <p className="text-zinc-500 text-sm">
          {property.ownerId.email}
        </p>
      </div>
    </div>
  </div>
)}

            {/* Tenant Info - Visible to Owner */}
{user?.role === 'OWNER' && property.tenantId && (
  <div className="mt-4 p-4 bg-zinc-800 rounded-xl border border-zinc-700">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
        <User size={18} className="text-green-400" />
      </div>
      <div>
        <p className="text-xs text-zinc-400 uppercase tracking-wide">
          Current Tenant
        </p>
        <p className="text-white font-semibold">
          {property.tenantId.name}
        </p>
        <p className="text-zinc-500 text-sm">
          {property.tenantId.email}
        </p>
      </div>
    </div>
  </div>
)}

            {/* Tenant Actions */}
            {user?.role === 'TENANT' && isTenantHere && (
              <div className="space-y-3 pt-4 border-t border-zinc-800">
                <PayRentButton propertyId={property._id} />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={leaveProperty}
                  className="w-full flex items-center justify-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
                >
                  <LogOut size={18} />
                  Leave Property
                </motion.button>
              </div>
            )}

            {/* Join Request Button */}
            {user?.role === 'TENANT' &&
              property.status === 'AVAILABLE' &&
              !property.tenantId && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={sendRequest}
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                <UserPlus size={18} />
                {sending ? 'Sending...' : 'Request to Join'}
              </motion.button>
            )}

            {/* 🔥 OWNER INVITE TENANT */}
{user?.role === 'OWNER' && !property.tenantId && (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={() => setShowInviteModal(true)}
    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
  >
    <UserPlus size={18} />
    Invite Tenant
  </motion.button>
)}

            {/* Owner Remove Tenant */}
            {user?.role === 'OWNER' && property.tenantId && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={removeTenant}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
              >
                <XCircle size={18} />
                Remove Tenant
              </motion.button>
            )}
          </div>
        </div>

        {/* Owner Join Requests */}
        {user?.role === 'OWNER' && requests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-6"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="text-indigo-400" size={20} />
              Join Requests
            </h2>
            <div className="space-y-3">
              {requests.map(r => (
                <div key={r._id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center">
                        <User size={16} className="text-indigo-400" />
                      </div>
                      <div>
                        <p className="font-medium">{r.tenantId.name}</p>
                        <p className="text-sm text-zinc-400">{r.tenantId.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => approve(r._id)}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm"
                      >
                        <CheckCircle size={16} />
                        Approve
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => reject(r._id)}
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm"
                      >
                        <XCircle size={16} />
                        Reject
                      </motion.button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
      {/* 🔥 INVITE MODAL HERE */}
      {showInviteModal && (
        <InviteTenant
          propertyId={property._id}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  )
}

export default PropertyDetails