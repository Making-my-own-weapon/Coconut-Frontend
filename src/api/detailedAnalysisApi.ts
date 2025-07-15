import { apiClient } from './client';

export interface DetailedAnalysisRequest {
  problemId: string;
  studentCode: string;
  staticAnalysisResult: string; // pyflakes 등 정적 분석 결과
}

export interface DetailedAnalysisResponse {
  analysis: {
    approach: string;
    pros: string;
    cons: string;
  };
  recommendation: string;
}

export const detailedAnalysisApi = {
  async analyze(request: DetailedAnalysisRequest): Promise<DetailedAnalysisResponse> {
    const response = await apiClient.post('/analysis/detailed', request);
    return response.data;
  },
};
