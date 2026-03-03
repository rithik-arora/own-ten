import axios from 'axios'

const API_URL = '/api/admin'

export const adminService = {
  getStats: async () => {
    const response = await axios.get(`${API_URL}/stats`)
    return response.data
  },

  getUsers: async ({ page = 1, limit = 10, role } = {}) => {
    const params = new URLSearchParams()
    params.append('page', page)
    params.append('limit', limit)
    if (role) params.append('role', role)
    const response = await axios.get(`${API_URL}/users?${params.toString()}`)
    return response.data
  },

  updateUserStatus: async (id, isActive) => {
    const response = await axios.put(`${API_URL}/users/${id}/status`, { isActive })
    return response.data
  },

  getDisputes: async ({ page = 1, limit = 10, status } = {}) => {
    const params = new URLSearchParams()
    params.append('page', page)
    params.append('limit', limit)
    if (status) params.append('status', status)
    const response = await axios.get(`${API_URL}/disputes?${params.toString()}`)
    return response.data
  },

  forceDisputeStatus: async (id, status, note) => {
    const response = await axios.put(`${API_URL}/disputes/${id}/force-status`, { status, note })
    return response.data
  }
}

