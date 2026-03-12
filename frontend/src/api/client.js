import axios from 'axios';
import authService from '../auth/authService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Shared API client that automatically attaches the auth token.
const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;

