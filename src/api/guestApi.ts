import { apiClient } from './client';

export const joinRoomAPI = (inviteCode: string, userName: string) => {
  return apiClient.post('/rooms/join', { inviteCode, userName });
};
