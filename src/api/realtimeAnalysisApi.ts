import { apiClient } from './client';

export interface RealtimeAnalysisRequest {
  problemId: string;
  studentCode: string;
}

export interface RealtimeAnalysisResponse {
  realtime_hints: string[];
  analysis: {
    approach: string;
  };
  recommendation: string;
}

export const realtimeAnalysisApi = {
  async analyze(request: RealtimeAnalysisRequest): Promise<RealtimeAnalysisResponse> {
    const response = await apiClient.post('analysis/realtime', request);
    return response.data;
  },
};
