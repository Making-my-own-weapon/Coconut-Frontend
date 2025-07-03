import { apiClient } from './client';

// 분석 결과 타입
export interface AnalysisResult {
  progress: {
    percentage: number;
    tests: string;
    time: string;
  };
  aiSuggestions: {
    type: 'performance' | 'optimization' | 'best-practice';
    title: string;
    line?: number;
  }[];
  execution: {
    problemTitle: string;
    time: string;
    memory: string;
    status: 'success' | 'fail';
  };
  complexity: {
    time: string;
    space: string;
    cyclomatic: number;
    loc: number;
  };
  quality: {
    efficiency: number;
    readability: number;
  };
  performanceImprovements: string[];
}

// 코드 제출 API
export const submitCodeAPI = (
  roomId: string,
  problemId: number,
  code: string,
  language: string,
) => {
  return apiClient.post(`/rooms/${roomId}/submissions`, {
    pid: problemId,
    code,
    language,
  });
};

// 채점 결과 조회 API
export const getSubmissionResultAPI = (submissionId: number) => {
  return apiClient.get(`/submissions/${submissionId}`);
};
