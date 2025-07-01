import { apiClient } from '../../api/client';

// 1. API 함수가 받을 데이터의 타입을 명확하게 정의합니다.
interface LoginData {
  email: string;
  password: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
}

// 2. data 파라미터에 any 대신 위에서 정의한 타입을 사용합니다.
export const loginAPI = (data: LoginData) => {
  return apiClient.post('/auth/login', data);
};

export const signupAPI = (data: SignupData) => {
  return apiClient.post('/auth/signup', data);
};

export const fetchUserAPI = () => {
  return apiClient.get('/auth/me');
};

export const refreshAPI = () => {
  return apiClient.post('/auth/refresh');
};

export const logoutAPI = () => {
  return apiClient.post('/auth/logout');
};
