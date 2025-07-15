import { create } from 'zustand';
import * as submissionApi from '../api/submissionApi';
import * as detailedAnalysisApi from '../api/detailedAnalysisApi';
import type { SubmissionResult } from '../api/submissionApi';
import type { DetailedAnalysisResponse } from '../api/detailedAnalysisApi';

interface SubmissionState {
  isSubmitting: boolean;
  isAnalyzing: boolean; // 상세 분석 로딩 상태 추가
  error: string | null;
  analysisResult: SubmissionResult | null;
  detailedAnalysis: DetailedAnalysisResponse | null; // 상세 분석 결과 추가
  submitCode: (roomId: string, problemId: string, code: string) => Promise<void>;
  closeAnalysis: () => void;
}

export const useSubmissionStore = create<SubmissionState>((set, get) => ({
  isSubmitting: false,
  isAnalyzing: false,
  error: null,
  analysisResult: null,
  detailedAnalysis: null,

  submitCode: async (roomId: string, problemId: string, code: string) => {
    set({
      isSubmitting: true,
      isAnalyzing: true,
      error: null,
      analysisResult: null,
      detailedAnalysis: null,
    });

    try {
      // 1. 코드 제출
      const response = await submissionApi.submitCodeAPI(roomId, problemId, code, 'python');
      const submission_id = response.data.data.submission_id;

      if (!submission_id) {
        throw new Error('응답에서 submission ID를 찾을 수 없습니다.');
      }

      // 2. 채점 폴링과 AI 분석을 동시에 시작
      const [submissionResult] = await Promise.allSettled([
        get().pollSubmissionResult(submission_id),
        get().performDetailedAnalysisAsync(problemId, code),
      ]);

      // 채점 결과 처리
      if (submissionResult.status === 'fulfilled') {
        set({ analysisResult: submissionResult.value, isSubmitting: false });
      } else {
        throw submissionResult.reason;
      }
    } catch (error) {
      console.error('코드 제출 에러:', error);
      set({
        error: error instanceof Error ? error.message : '코드 제출 중 에러가 발생했습니다.',
        isSubmitting: false,
        isAnalyzing: false,
      });
    }
  },

  // 채점 결과 폴링을 별도 함수로 분리
  pollSubmissionResult: async (submission_id: number): Promise<SubmissionResult> => {
    const maxAttempts = 15; // 30초 / 2초 = 15번
    let attempts = 0;

    while (attempts < maxAttempts) {
      attempts++;

      try {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2초 대기

        const resultResponse = await submissionApi.getSubmissionResultAPI(submission_id);
        const result = resultResponse.data.data;

        console.log(`[폴링 시도 #${attempts}] 수신 상태: ${result.status}`);

        // 채점이 완료된 경우
        if (result.status === 'SUCCESS' || result.status === 'FAIL') {
          return result;
        }
      } catch (pollError) {
        console.warn(`폴링 시도 ${attempts} 실패:`, pollError);
        // 폴링 에러는 무시하고 계속 시도
      }
    }

    throw new Error('채점 결과를 가져오는데 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.');
  },

  // AI 분석을 비동기로 수행 (채점과 독립적)
  performDetailedAnalysisAsync: async (problemId: string, code: string) => {
    try {
      // 기본 정적 분석 결과 (채점 결과 없이도 분석 가능)
      const staticAnalysisResult = `
코드 길이: ${code.length}자
함수 개수: ${(code.match(/def\s+\w+/g) || []).length}개
반복문 사용: ${code.includes('for') || code.includes('while') ? '있음' : '없음'}
조건문 사용: ${code.includes('if') ? '있음' : '없음'}
      `.trim();

      const detailedResult = await detailedAnalysisApi.detailedAnalysisApi.analyze({
        problemId,
        studentCode: code,
        staticAnalysisResult,
      });

      set({ detailedAnalysis: detailedResult, isAnalyzing: false });
    } catch (error) {
      console.error('상세 분석 에러:', error);
      set({ isAnalyzing: false });
      // AI 분석 실패는 치명적이지 않으므로 에러를 표시하지 않음
    }
  },

  closeAnalysis: () => {
    set({ analysisResult: null, detailedAnalysis: null });
  },
}));
