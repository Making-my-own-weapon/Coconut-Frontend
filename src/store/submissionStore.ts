import { create } from 'zustand';
import * as submissionApi from '../api/submissionApi';
import type { AnalysisResult } from '../api/submissionApi';

interface SubmissionState {
  isSubmitting: boolean;
  error: string | null;
  analysisResult: AnalysisResult | null;
  submitCode: (roomId: string, problemId: number, code: string) => Promise<void>;
  closeAnalysis: () => void;
}

export const useSubmissionStore = create<SubmissionState>((set) => ({
  isSubmitting: false,
  error: null,
  analysisResult: null,

  submitCode: async (roomId, problemId, code) => {
    set({ isSubmitting: true, error: null, analysisResult: null });
    try {
      const response = await submissionApi.submitCodeAPI(roomId, problemId, code, 'python');
      const { submissionId: _submissionId } = response.data;

      // TODO: 실제로는 submissionId로 결과가 나올 때까지 주기적으로 물어보는 '폴링(Polling)' 로직이 필요합니다.
      // 지금은 2초 뒤에 가짜 결과를 보여주는 것으로 대체합니다.
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // const resultResponse = await submissionApi.getSubmissionResultAPI(submissionId);
      // set({ analysisResult: resultResponse.data });
    } catch {
      set({ error: '코드 제출 또는 분석 중 에러가 발생했습니다.' });
    } finally {
      set({ isSubmitting: false });
    }
  },

  closeAnalysis: () => {
    set({ analysisResult: null });
  },
}));
