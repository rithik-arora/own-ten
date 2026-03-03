import axios from 'axios'

const API_URL = '/api/analytics'

export const analyticsService = {
  getOwnerAnalytics: async () => {
    const response = await axios.get(`${API_URL}/owner`)
    return response.data
  },

  getAdminAnalytics: async () => {
    const response = await axios.get(`${API_URL}/admin`)
    return response.data
  }
}

