import { apiClient } from './client';

export const joinRoomAPI = (inviteCode: string) => {
  // apiClient를 사용하면 인증 토큰은 자동으로 헤더에 포함됩니다.
  // 따라서 더 이상 userId를 파라미터로 받을 필요가 없습니다.
  return apiClient.post('/rooms/join', { inviteCode });
};
