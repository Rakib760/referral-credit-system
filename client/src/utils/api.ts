import axios from 'axios';

// Base URL WITHOUT /api
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
    return Promise.reject(new Error(errorMessage));
  }
);

// API endpoints WITH /api prefix
export const authApi = {
  login: (email: string, password: string) => 
    api.post('/api/auth/login', { email, password }),
  
  register: (email: string, password: string, name: string, referralCode?: string) => 
    api.post('/api/auth/register', { email, password, name, referralCode }),
  
  getMe: () => api.get('/api/auth/me'),
  
  forgotPassword: (email: string) => 
    api.post('/api/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) => 
    api.post('/api/auth/reset-password', { token, password }),
  
  verifyResetToken: (token: string) => 
    api.post('/api/auth/verify-reset-token', { token }),
  
  updateProfile: (name: string) => 
    api.put('/api/auth/profile', { name }),
};

export const referralApi = {
  getStats: () => api.get('/api/referrals/stats'),
  getHistory: () => api.get('/api/referrals/history'),
};

export const purchaseApi = {
  createPurchase: (productId: string, productName: string, amount: number) =>
    api.post('/api/purchases', { productId, productName, amount }),
  getHistory: () => api.get('/api/purchases/history'),
};

export default api;