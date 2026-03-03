import axios from 'axios'

const API_BASE = 'http://localhost:5000'

const api = axios.create({
  baseURL: `${API_BASE}/api/properties`
})

/* ================= TOKEN ATTACH ================= */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const propertyService = {

  /* ================= OWNER / ADMIN ================= */
  getProperties: async () => {
    const res = await api.get('/', { headers: { 'Cache-Control': 'no-cache' } })
    return res.data
  },

  getProperty: async (id) => {
    const res = await api.get(`/${id}`)
    return res.data
  },

  createProperty: async (data) => {
    const res = await api.post('/', data)
    return res.data
  },

  updateProperty: async (id, data) => {
    const res = await api.put(`/${id}`, data)
    return res.data
  },

  deleteProperty: async (id) => {
    const res = await api.delete(`/${id}`)
    return res.data
  },

  /* ================= PUBLIC PROPERTIES ================= */
  getPublicProperties: async () => {
    const res = await api.get('/public')
    return res.data
  },

  /* ================= IMAGE UPLOAD ================= */
  uploadPropertyImage: async (id, formData) => {
    const res = await api.post(`/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return res.data
  },

  generateInviteLink: async (propertyId,email) => {
  const res = await api.post(`/${propertyId}/invite`,{email:email})
  return res.data
},

  /* ================= JOIN REQUEST ================= */
  sendJoinRequest: async (propertyId) => {
    const res = await axios.post(
      `${API_BASE}/api/join-requests/${propertyId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    )
    return res.data
  }
}