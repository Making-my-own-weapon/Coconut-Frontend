import { apiClient } from './client';

// 문제 생성을 위한 데이터 타입 (DTO)
export interface CreateProblemDto {
  title: string;
  timeLimit: number;
  memoryLimit: number;
  categories: string[];
  description: string;
  testCases: { input: string; output: string }[];
}

// 문제를 DB에 생성하는 API
export const createProblemAPI = (data: CreateProblemDto) => {
  return apiClient.post<{ id: number }>('db/problems', data);
};

// 특정 방에 문제들을 할당하는 API
export const assignProblemsToRoomAPI = (roomId: number, problemIds: number[]) => {
  return apiClient.post(`/rooms/${roomId}/problems`, { problemIds });
};

// 모든 문제 요약 정보를 가져오는 API
export const fetchAllSummariesAPI = () => {
  return apiClient.get('db/problems/summary');
};
