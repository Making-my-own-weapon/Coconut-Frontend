import { apiClient } from './client';

export const deleteUserAPI = () => {
  return apiClient.delete('/users/me');
};

export const leaveRoomAPI = () => {
  return apiClient.patch('/users/me/leave-room');
};

export const changePasswordAPI = (currentPassword: string, newPassword: string) => {
  return apiClient.patch('/users/me/password', {
    currentPassword,
    newPassword,
  });
};
