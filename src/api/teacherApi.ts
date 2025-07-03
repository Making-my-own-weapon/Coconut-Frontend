//src/api/teacherApi.ts
import { apiClient } from './client';

// 수업 생성 시 보낼 데이터의 타입
export interface CreateRoomData {
  title: string;
  maxParticipants: number;
  description: string;
}

// 수업 생성 API 함수
export const createRoomAPI = (data: CreateRoomData) => {
  // API 명세서에 따라 POST /api/v1/rooms 로 요청
  return apiClient.post('/rooms/create', data);
};

export const getRoomDetailsAPI = (roomId: string) => {
  return apiClient.get(`/rooms/${roomId}`);
};

export const updateRoomStatusAPI = (roomId: string, status: 'STARTED' | 'ENDED') => {
  return apiClient.patch(`/rooms/${roomId}`, { status });
};
