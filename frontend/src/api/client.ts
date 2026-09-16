import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const LOCAL_URL = 'http://127.0.0.1:8000/api';
const PROD_URL = 'https://celarox.onrender.com/api';

// Automatically detect host
export const API_BASE_URL = typeof window !== 'undefined' && window.location && window.location.hostname === 'localhost'
  ? LOCAL_URL
  : PROD_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// Request Interceptor: Attach Access Token & Active Workspace Header
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const accessToken = await AsyncStorage.getItem('@celarox_access_token');
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      const activeWorkspaceId = await AsyncStorage.getItem('@celarox_active_workspace_id');
      if (activeWorkspaceId && config.headers) {
        config.headers['X-Workspace-Id'] = activeWorkspaceId;
      }
    } catch (e) {
      console.warn('Error reading auth/workspace tokens from storage:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto refresh on 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('@celarox_refresh_token');
        if (refreshToken) {
          const res = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          if (res.data?.access) {
            await AsyncStorage.setItem('@celarox_access_token', res.data.access);
            originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshErr) {
        await AsyncStorage.multiRemove([
          '@celarox_access_token',
          '@celarox_refresh_token',
          '@celarox_user',
        ]);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
