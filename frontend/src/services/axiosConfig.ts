import axios, { AxiosInstance } from 'axios';
import { BACKEND_BASE_URL } from 'config';

const apiClient: AxiosInstance = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: 7000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
