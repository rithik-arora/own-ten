import axios from 'axios'

const API_URL = 'http://localhost:5000/api/invitations'

const invitationApi = axios.create({
  baseURL: API_URL
})

// Attach JWT token automatically
invitationApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export const invitationService = {

  // Join property using invite token
  joinWithToken: async (inviteToken) => {
    return invitationApi.post('/join', {
      token: inviteToken
    })
  },

  // Tenant inbox - pending invitations
  getMyInvitations: async () => {
    return invitationApi.get('/my')
  },

  // Accept invitation from inbox
  acceptInvitation: async (invitationId) => {
    return invitationApi.post(`/accept/${invitationId}`)
  },

  // Reject invitation
  rejectInvitation: async (invitationId) => {
    return invitationApi.post(`/reject/${invitationId}`)
  }
}
