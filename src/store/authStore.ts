//src/store/auth/authStore.ts
import { create } from 'zustand';
import { apiClient } from '../api/client';
import * as authApi from '../api/authApi';

// 스토어의 상태(state)와 액션(action)의 타입을 정의합니다.
interface AuthState {
  isLoggedIn: boolean;
  accessToken: string | null;
  user: { id: number; email: string; name: string } | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  silentRefresh: () => Promise<void>;
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isLoggedIn: false,
  accessToken: null,
  user: null,

  login: async (email, password) => {
    const response = await authApi.loginAPI({ email, password });
    const { accessToken } = response.data;
    set({ accessToken, isLoggedIn: true });
    if (apiClient.defaults.headers.common) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`; //axios클라이언트의 기본 헤더를 설정 1
    }
    await get().fetchUser();
  },

  signup: async (name, email, password) => {
    await authApi.signupAPI({ name, email, password });
  },

  fetchUser: async () => {
    try {
      const response = await authApi.fetchUserAPI();
      set({ user: response.data });
    } catch {
      // 에러 처리는 client.ts의 인터셉터가 담당
    }
  },

  silentRefresh: async () => {
    try {
      const response = await authApi.refreshAPI();
      const { accessToken } = response.data;
      set({ accessToken, isLoggedIn: true });
      if (apiClient.defaults.headers.common) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`; //axios클라이언트의 기본 헤더를 설정 2
      }
      await get().fetchUser();
    } catch {
      console.log('Silent refresh failed, user is not logged in.');
    }
  },

  setAccessToken: (token: string) => {
    set({ accessToken: token, isLoggedIn: true });
    if (apiClient.defaults.headers.common) {
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  },

  logout: async () => {
    try {
      await authApi.logoutAPI();
    } catch (error) {
      console.error('로그아웃 중 에러 발생:', error);
    } finally {
      set({ accessToken: null, isLoggedIn: false, user: null });
      if (apiClient.defaults.headers.common) {
        delete apiClient.defaults.headers.common['Authorization'];
      }
    }
  },
}));
