import axios from 'axios'

const API_URL = '/api/notifications'

export const notificationService = {
  fetchNotifications: async ({ limit = 20, skip = 0, isRead } = {}) => {
    const params = new URLSearchParams()
    params.append('limit', limit)
    params.append('skip', skip)
    if (isRead !== undefined) params.append('isRead', isRead)

    const query = params.toString()
    const url = query ? `${API_URL}?${query}` : API_URL

    const response = await axios.get(url)
    return response.data
  },

  markRead: async (id) => {
    const response = await axios.patch(`${API_URL}/${id}/read`)
    return response.data
  },

  markAllRead: async () => {
    const response = await axios.patch(`${API_URL}/read-all`)
    return response.data
  }
}
