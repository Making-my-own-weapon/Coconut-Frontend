import api from './api';
import type { ProblemSummary } from '../ProblemImportForm';

// 테스트 케이스 타입
export interface TestCase {
  input: string;
  output: string;
}

// 문제 생성 DTO (CreateDbProblemDto 형식과 일치)
export interface CreateProblemDto {
  title: string;
  timeLimit: number; // 전체 제한시간(초)
  memoryLimit: number; // 메모리 제한(MB)
  categories: string[]; // 분류 목록
  description: string; // 문제 설명
  testCases: TestCase[]; // 테스트 케이스
}

// 문제 세부사항 DTO
export interface ProblemDetail {
  id: number;
  title: string;
  timeLimit: number;
  memoryLimit: number;
  categories: string[];
  description: string;
  testCases: TestCase[];
}

/**
 * 전체 문제 요약(summary) 데이터를 가져옴.
 */
export async function fetchAllSummaries(): Promise<ProblemSummary[]> {
  const res = await api.get<ProblemSummary[]>('/api/v1/db/problems/summary');
  return res.data;
}

/**
 * DB에 새 문제 생성
 */
export async function createProblem(dto: CreateProblemDto): Promise<{ id: number }> {
  const res = await api.post<{ id: number }>('/api/v1/db/problems', dto);
  return res.data;
}

/**
 * 특정 방에 문제 할당
 */
export async function assignProblemsToRoom(roomId: number, pids: number[]): Promise<void> {
  await api.post(`/api/v1/rooms/${roomId}/problems`, { pids });
}

/**
 * 특정 방의 문제 목록 조회
 */
export async function getProblemsByRoomId(roomId: number): Promise<ProblemSummary[]> {
  const res = await api.get<ProblemSummary[]>(`/api/v1/rooms/${roomId}/problems`);
  return res.data;
}

/**
 * 특정 방의 특정 문제 상세 조회
 */
export async function getProblemDetailByRoodId(
  roomId: number,
  pid: number,
): Promise<ProblemDetail> {
  const res = await api.get<ProblemDetail>(`/api/v1/rooms/${roomId}/problems/${pid}`);
  return res.data;
}
