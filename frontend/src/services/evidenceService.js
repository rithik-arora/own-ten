import axios from 'axios';

const API_BASE =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

const API_URL = `${API_BASE}/api/evidence`;

/* ===============================
   AXIOS INSTANCE
================================ */

const evidenceApi = axios.create({
  baseURL: API_URL
});

evidenceApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ===============================
   SERVICE
================================ */

export const evidenceService = {

  /* ---------- Upload ---------- */

  uploadEvidence: async ({ disputeId, file, onProgress }) => {

    const formData = new FormData();
    formData.append('disputeId', disputeId);
    formData.append('file', file);

    const response = await evidenceApi.post(
      '/upload',
      formData,
      {
        // Let browser set multipart boundary automatically
        onUploadProgress: (evt) => {

          if (!evt.total) return;

          const percent = Math.round(
            (evt.loaded * 100) / evt.total
          );

          onProgress?.({ percent });
        }
      }
    );

    return response.data;
  },

  /* ---------- List ---------- */

  getEvidenceByDispute: async (disputeId) => {
    const response = await evidenceApi.get(`/${disputeId}`);
    return response.data;
  },

  /* ---------- Stream (VIEW + DOWNLOAD) ---------- */

  streamEvidence: async ({ url }) => {

    const token = localStorage.getItem('token');

    const streamUrl =
      `${API_URL}/stream?url=${encodeURIComponent(url)}`;

    return fetch(streamUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  }

};

