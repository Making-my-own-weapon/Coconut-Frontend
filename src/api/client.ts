//src/api/client.ts
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../store/authStore';

// 1. 재시도 로직을 위해 Axios 요청 설정에 커스텀 속성을 추가합니다.
interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// 2. 대기열에 저장될 Promise의 resolve, reject 타입을 정의합니다.
interface FailedQueuePromise {
  resolve: (value: string | null) => void;
  reject: (error: AxiosError) => void;
}

export const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue: FailedQueuePromise[] = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: CustomRequestConfig = error.config!;
    const authStore = useAuthStore.getState();

    if (error.response?.status === 401 && !originalRequest._retry && authStore.accessToken) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise<string | null>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;
      try {
        const res = await apiClient.post('/auth/refresh');
        const { accessToken } = res.data;
        useAuthStore.getState().setAccessToken(accessToken);

        if (originalRequest.headers) {
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`; //요청이 실패했다가 재발급 성공했을 때, 실패했던 바로 그  요청의 헤더를 갱신하기 위함.
        }

        processQueue(null, accessToken);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        authStore.logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);
