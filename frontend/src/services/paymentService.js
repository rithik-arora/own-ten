import axios from 'axios'

const API_URL = '/api/payments'

export const paymentService = {
  createOrder: async ({ propertyId, type, disputeId }) => {
    const res = await axios.post(`${API_URL}/create-order`, {
      propertyId,
      type,
      ...(disputeId ? { disputeId } : {})
    })
    return res.data
  },

  verifyPayment: async (payload) => {
    const res = await axios.post(`${API_URL}/verify`, payload)
    return res.data
  },

  getMyPayments: async () => {
    const res = await axios.get(`${API_URL}/my`)
    return res.data
  },

  // ⭐ FIXED
  getOwnerPayments: async () => {
    const res = await axios.get(`${API_URL}/owner`)
    // return res.data.data
    return res.data
  }
}