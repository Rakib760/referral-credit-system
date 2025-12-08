import axios from 'axios';

// Base URL WITHOUT /api
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

console.log('🔧 API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// FIXED Request interceptor - Better token handling
api.interceptors.request.use(
  (config) => {
    console.log('🚀 API Request to:', config.url);
    
    // Check if we're in browser
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        console.log('🔍 Token check:', token ? 'Found' : 'Not found');
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('✅ Token added to headers');
        } else {
          console.warn('❌ No auth token available');
        }
      } catch (error) {
        console.error('❌ Error accessing storage:', error);
      }
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response.data;
  },
  (error) => {
    console.error('❌ API Error Details:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      headers: error.config?.headers
    });
    
    const errorMessage = error.response?.data?.error || 
                        error.response?.data?.message || 
                        error.message || 
                        'Request failed';
    
    // Auto-logout on 401
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      console.log('🔒 401 Unauthorized - Clearing token');
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    
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
  getStats: () => {
    console.log('📊 Calling referral stats API');
    return api.get('/api/referrals/stats');
  },
  getHistory: () => {
    console.log('📜 Calling referral history API');
    return api.get('/api/referrals/history');
  },
  getLeaderboard: () => {
    console.log('🏆 Calling leaderboard API');
    return api.get('/api/referrals/leaderboard');
  },
  validateCode: (code: string) => 
    api.get(`/api/referrals/validate/${code}`),
};

export const purchaseApi = {
  createPurchase: (productId: string, productName: string, amount: number) => {
    console.log('🛒 Creating purchase:', productName);
    return api.post('/api/purchases', { productId, productName, amount });
  },
  getHistory: () => {
    console.log('📋 Calling purchase history API');
    return api.get('/api/purchases/history');
  },
};

export default api;