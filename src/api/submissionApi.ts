import { apiClient } from './client';
import type { AxiosResponse } from 'axios';

// 제출 응답 타입
export interface SubmissionResponse {
  statusCode: number;
  message: string;
  data: {
    submission_id: number; // 백엔드에서 submission_id로 응답
  };
}

// 제출 결과 타입
export interface SubmissionResult {
  submissionId: number;
  status: string;
  isPassed: boolean;
  passedTestCount: number;
  totalTestCount: number;
  executionTimeMs: number;
  memoryUsageKb: number;
  output: string;
  createdAt: string;
  updatedAt: string;
}

// 제출 결과 응답 타입
export interface SubmissionResultResponse {
  statusCode: number;
  data: SubmissionResult;
}

// 코드 제출 API
export const submitCodeAPI = (
  roomId: string,
  problemId: string,
  code: string,
  language: string,
): Promise<AxiosResponse<SubmissionResponse>> => {
  return apiClient.post(`/rooms/${roomId}/submissions`, {
    pid: problemId,
    code,
    language,
  });
};

// 채점 결과 조회 API
export const getSubmissionResultAPI = (
  submissionId: number,
): Promise<AxiosResponse<SubmissionResultResponse>> => {
  return apiClient.get(`/submissions/${submissionId}`);
};
