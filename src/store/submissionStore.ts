import { create } from 'zustand';
import * as submissionApi from '../api/submissionApi';
import type { SubmissionResult } from '../api/submissionApi';

interface SubmissionState {
  isSubmitting: boolean;
  error: string | null;
  analysisResult: SubmissionResult | null;
  submitCode: (roomId: string, problemId: string, code: string) => Promise<void>;
  closeAnalysis: () => void;
}

export const useSubmissionStore = create<SubmissionState>((set) => ({
  isSubmitting: false,
  error: null,
  analysisResult: null,

  submitCode: async (roomId: string, problemId: string, code: string) => {
    set({ isSubmitting: true, error: null, analysisResult: null });
    try {
      // 1. 코드 제출
      const response = await submissionApi.submitCodeAPI(roomId, problemId, code, 'python');
      const { submission_id } = response.data;

      // 2. 폴링으로 결과 조회 (최대 30초, 2초 간격)
      const maxAttempts = 15; // 30초 / 2초 = 15번
      let attempts = 0;

      while (attempts < maxAttempts) {
        attempts++;

        try {
          await new Promise((resolve) => setTimeout(resolve, 2000)); // 2초 대기

          const resultResponse = await submissionApi.getSubmissionResultAPI(submission_id);
          const result = resultResponse.data;

          // 채점이 완료된 경우 (SUCCESS, FAIL 등)
          if (
            result.status === 'SUCCESS' ||
            result.status === 'FAIL' ||
            result.status === 'ERROR'
          ) {
            set({ analysisResult: result });
            return;
          }

          // 아직 진행 중인 경우 계속 대기
        } catch (pollError) {
          console.warn(`폴링 시도 ${attempts} 실패:`, pollError);
          // 폴링 에러는 무시하고 계속 시도
        }
      }

      // 타임아웃 발생
      set({ error: '채점 결과를 가져오는데 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.' });
    } catch (error) {
      console.error('코드 제출 에러:', error);
      set({ error: '코드 제출 중 에러가 발생했습니다.' });
    } finally {
      set({ isSubmitting: false });
    }
  },

  closeAnalysis: () => {
    set({ analysisResult: null });
  },
}));
