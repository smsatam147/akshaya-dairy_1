/**
 * api/axios.js — Axios instance with JWT interceptor.
 * Access token stored in memory only (ADR-003 — not localStorage).
 * On 401, silently calls /auth/refresh/ and retries original request.
 */
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || '/api/v1';

// In-memory token store (NOT localStorage — XSS protection)
let accessToken = null;

export const setAccessToken = (token) => { accessToken = token; };
export const getAccessToken = () => accessToken;
export const clearAccessToken = () => { accessToken = null; };

// Read-only guest flag - blocks data-mutating requests for the viewer role
let readOnly = false;
export const setReadOnly = (v) => { readOnly = v; };
export const getReadOnly = () => readOnly;

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,  // send httpOnly refresh cookie
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

// Request interceptor — attach Bearer token
api.interceptors.request.use(
  (config) => {
    const _m = (config.method || 'get').toLowerCase();
    const _u = config.url || '';
    const _isWrite = !['get', 'head', 'options'].includes(_m);
    const _isAuthAction = _u.indexOf('/auth/login') !== -1 || _u.indexOf('/auth/logout') !== -1;
    if (readOnly && _isWrite && !_isAuthAction) {
      return Promise.reject({
        config,
        response: { status: 403, data: { message: 'Not authorized: this is a read-only guest account.' } },
        isReadOnlyBlock: true,
      });
    }
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 with silent token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else       prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        // Queue the request until refresh is done
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers['Authorization'] = `Bearer ${token}`;
          return api(original);
        }).catch((err) => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${BASE_URL}/auth/refresh/`, {}, { withCredentials: true });
        const newToken = res.data.data.access_token;
        setAccessToken(newToken);
        processQueue(null, newToken);
        original.headers['Authorization'] = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearAccessToken();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
