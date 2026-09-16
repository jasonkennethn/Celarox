import axios, { InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const PROD_URL = 'https://celarox.onrender.com/api';

/**
 * Smart URL resolver:
 * Automatically uses the appropriate backend host based on execution environment
 */
export const getApiBaseUrl = (): string => {
  // 1. Explicit environment variable override
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Web browser environment
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname || '';

    // Check if running on localhost, loopback, or private local network
    const isLocal =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('172.17.') ||
      hostname.startsWith('172.18.') ||
      hostname.startsWith('172.19.') ||
      hostname.startsWith('172.20.') ||
      hostname.startsWith('172.21.') ||
      hostname.startsWith('172.22.') ||
      hostname.startsWith('172.23.') ||
      hostname.startsWith('172.24.') ||
      hostname.startsWith('172.25.') ||
      hostname.startsWith('172.26.') ||
      hostname.startsWith('172.27.') ||
      hostname.startsWith('172.28.') ||
      hostname.startsWith('172.29.') ||
      hostname.startsWith('172.30.') ||
      hostname.startsWith('172.31.') ||
      hostname.endsWith('.local');

    if (isLocal) {
      const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
      return `${protocol}//${hostname}:8000/api`;
    }
  }

  // 3. React Native Mobile Platform local dev fallbacks
  if (Platform.OS === 'android' && __DEV__) {
    return 'http://10.0.2.2:8000/api';
  }
  if (Platform.OS === 'ios' && __DEV__) {
    return 'http://127.0.0.1:8000/api';
  }

  // Default to production cloud API
  return PROD_URL;
};

export const API_BASE_URL = getApiBaseUrl();

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
      // Dynamic base URL check if needed
      if (!config.baseURL || config.baseURL === '') {
        config.baseURL = getApiBaseUrl();
      }

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
          const currentBase = apiClient.defaults.baseURL || getApiBaseUrl();
          const res = await axios.post(`${currentBase}/auth/token/refresh/`, {
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
