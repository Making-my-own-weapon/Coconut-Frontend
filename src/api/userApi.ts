import { apiClient } from './client';

export const deleteUserAPI = () => {
  return apiClient.delete('/users/me');
};

export const leaveRoomAPI = () => {
  return apiClient.patch('/users/me/leave-room');
};
