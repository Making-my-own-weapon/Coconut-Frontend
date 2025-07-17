import { apiClient } from './client';

// 세션 생성
export const createOpenViduSession = (customSessionId: string) =>
  apiClient.post('/openvidu/sessions', { customSessionId });

// 토큰 발급 (role 정보 포함)
export const createOpenViduToken = (
  sessionId: string,
  role: 'PUBLISHER' | 'SUBSCRIBER' = 'PUBLISHER',
) => apiClient.post(`/openvidu/sessions/${sessionId}/connections`, { role });
