import { apiClient } from './client';

// 문제 생성을 위한 데이터 타입 (DTO)
export interface CreateProblemDto {
  title: string;
  timeLimitMs: number; // 변경: timeLimit → timeLimitMs
  memoryLimitKb: number; // 변경: memoryLimit → memoryLimitKb
  solveTimeLimitMin?: number; // 추가: 풀이 제한(분) 옵션
  source: 'My' | 'BOJ'; // 추가: 출처 enum
  categories: string[];
  description: string;
  testCases: { inputTc: string; outputTc: string }[];
}

// 문제를 DB에 생성하는 API
export const createProblemAPI = (data: CreateProblemDto) => {
  return apiClient.post<{ problemId: number }>('db/problems', data);
};

// 특정 방에 문제들을 할당하는 API
export const assignProblemsToRoomAPI = (roomId: number, problemIds: number[]) => {
  return apiClient.post(`/rooms/${roomId}/problems`, { problemIds });
};

// 모든 문제 요약 정보를 가져오는 API
export const fetchAllSummariesAPI = () => {
  return apiClient.get('db/problems/summary');
};

// 특정 문제 상세 정보를 가져오는 API (방 할당 여부와 관계없이)
export const fetchProblemDetailByIdAPI = (problemId: number) => {
  return apiClient.get(`db/problems/${problemId}`);
};

// 특정 방에서 문제를 삭제하는 API
export const deleteProblemFromRoomAPI = (roomId: number, problemId: number) => {
  return apiClient.delete(`/rooms/${roomId}/problems/${problemId}`);
};

// 내가 만든 문제 목록을 가져오는 API
export const fetchMyProblemsAPI = () => {
  return apiClient.get('db/problems/my');
};

// DB에서 문제를 영구적으로 삭제하는 API
export const deleteProblemAPI = (problemId: number) => {
  return apiClient.delete(`db/problems/${problemId}`);
};
