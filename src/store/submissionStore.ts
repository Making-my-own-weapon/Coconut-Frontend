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
      // 1. 코드 제출 (response.data.data로 접근)
      const response = await submissionApi.submitCodeAPI(roomId, problemId, code, 'python');
      const submission_id = response.data.data.submission_id;

      // submission_id가 없을 경우를 대비한 방어 코드
      if (!submission_id) {
        throw new Error('응답에서 submission ID를 찾을 수 없습니다.');
      }

      // 2. 폴링으로 결과 조회 (최대 30초, 2초 간격)
      const maxAttempts = 15; // 30초 / 2초 = 15번
      let attempts = 0;

      while (attempts < maxAttempts) {
        attempts++;

        try {
          await new Promise((resolve) => setTimeout(resolve, 2000)); // 2초 대기

          const resultResponse = await submissionApi.getSubmissionResultAPI(submission_id);
          // 실제 결과 데이터는 resultResponse.data.data에 있습니다.
          const result = resultResponse.data.data;

          // 각 폴링 시도의 상태를 로그로 출력합니다.
          console.log(`[폴링 시도 #${attempts}] 수신 상태: ${result.status}`);

          // 채점이 완료된 경우 (SUCCESS 또는 FAIL)에만 폴링을 종료합니다.
          if (result.status === 'SUCCESS' || result.status === 'FAIL') {
            set({ analysisResult: result, isSubmitting: false });
            return;
          }
        } catch (pollError) {
          console.warn(`폴링 시도 ${attempts} 실패:`, pollError);
          // 폴링 에러는 무시하고 계속 시도
        }
      }

      // 타임아웃 발생 시 isSubmitting을 false로 설정합니다.
      set({
        error: '채점 결과를 가져오는데 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.',
        isSubmitting: false,
      });
    } catch (error) {
      console.error('코드 제출 에러:', error);
      set({ error: '코드 제출 중 에러가 발생했습니다.', isSubmitting: false });
    }
  },

  closeAnalysis: () => {
    set({ analysisResult: null });
  },
}));
