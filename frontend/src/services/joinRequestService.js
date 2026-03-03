import axios from 'axios'

const API_BASE = 'http://localhost:5000'
const API_URL = `${API_BASE}/api/join-requests`

const joinRequestApi = axios.create({
  baseURL: API_URL
})

joinRequestApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export const joinRequestService = {
  createJoinRequest: async (propertyId) => {
    const response = await joinRequestApi.post(`/${propertyId}`)
    return response.data
  },

  getMyJoinRequests: async () => {
    const response = await joinRequestApi.get('/my')
    return response.data
  },

  getPropertyJoinRequests: async (propertyId) => {
    const response = await joinRequestApi.get(`/property/${propertyId}`)
    return response.data
  },

  approveJoinRequest: async (requestId) => {
    const response = await joinRequestApi.post(`/${requestId}/approve`)
    return response.data
  },

  rejectJoinRequest: async (requestId) => {
    const response = await joinRequestApi.post(`/${requestId}/reject`)
    return response.data
  }
}

