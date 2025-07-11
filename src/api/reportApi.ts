import { apiClient } from './client';

export const getReportAPI = (roomId: string) => {
  return apiClient.get(`/rooms/${roomId}/report`);
};
