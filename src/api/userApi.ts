import { apiClient } from './client';

export const deleteUserAPI = () => {
  return apiClient.delete('/users/me');
};
