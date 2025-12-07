import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '@/types';
import { authApi } from '@/utils/api';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login(email, password) as any;
          set({
            user: response.user || response.data?.user,
            token: response.token || response.data?.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string, referralCode?: string) => {
        set({ isLoading: true });
        try {
          const response = await authApi.register(email, password, name, referralCode) as any;
          set({
            user: response.user || response.data?.user,
            token: response.token || response.data?.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      updateUser: (userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },

      forgotPassword: async (email: string) => {
        try {
          const response = await authApi.forgotPassword(email) as any;
          return response;
        } catch (error) {
          throw error;
        }
      },

      resetPassword: async (token: string, password: string) => {
        try {
          const response = await authApi.resetPassword(token, password) as any;
          return response;
        } catch (error) {
          throw error;
        }
      },

      updateProfile: async (name: string) => {
        try {
          const response = await authApi.updateProfile(name) as any;
          get().updateUser(response.user || response.data?.user);
          return response;
        } catch (error) {
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);