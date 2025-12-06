export interface User {
  id: string;
  email: string;
  name: string;
  referralCode: string;
  credits: number;
  isVerified: boolean;
}

export interface ReferralStats {
  totalReferred: number;
  convertedUsers: number;
  totalCreditsEarned: number;
  currentCredits: number;
  referralCode: string;
}

export interface ReferralHistory {
  referredEmail: string;
  status: 'pending' | 'converted' | 'expired';
  createdAt: string;
  convertedAt?: string;
  creditsAwarded: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface Purchase {
  id: string;
  productName: string;
  amount: number;
  creditsEarned: number;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, referralCode?: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  forgotPassword: (email: string) => Promise<any>;
  resetPassword: (token: string, password: string) => Promise<any>;
  updateProfile: (name: string) => Promise<any>;
}