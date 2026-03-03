import axios from 'axios';

const API_URL = '/api/disputes';

export const disputeService = {
  // Get all disputes
  getDisputes: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.priority) params.append('priority', filters.priority);
    
    const queryString = params.toString();
    const url = queryString ? `${API_URL}?${queryString}` : API_URL;
    
    const response = await axios.get(url);
    return response.data;
  },

  // Get single dispute
  getDispute: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Create dispute
  createDispute: async (disputeData) => {
    const response = await axios.post(API_URL, disputeData);
    return response.data;
  },

  // Update dispute status
  updateDisputeStatus: async (id, status, note = '') => {
    const response = await axios.patch(`${API_URL}/${id}/status`, { status, note });
    return response.data;
  },

  // Get dispute activity timeline
  getTimeline: async (id) => {
    const response = await axios.get(`${API_URL}/${id}/timeline`);
    return response.data;
  }
};

