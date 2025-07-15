import { useState, useEffect, useCallback } from 'react';
import { realtimeAnalysisApi, type RealtimeAnalysisResponse } from '../api/realtimeAnalysisApi';

interface UseRealtimeAnalysisProps {
  code: string;
  problemId?: string;
  enabled?: boolean;
}

export const useRealtimeAnalysis = ({
  code,
  problemId, // 기본값 제거
  enabled = true,
}: UseRealtimeAnalysisProps) => {
  const [result, setResult] = useState<RealtimeAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeCode = useCallback(
    async (sourceCode: string, probId: string | undefined) => {
      if (!sourceCode.trim() || !enabled || !probId) {
        // problemId가 없으면 분석 안 함
        setResult(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await realtimeAnalysisApi.analyze({
          problemId: probId,
          studentCode: sourceCode,
        });

        setResult(response);
      } catch (err: any) {
        console.error('실시간 분석 API 호출 실패:', err);
        setError(err.response?.data?.message || err.message || '분석 중 오류가 발생했습니다.');
        setResult(null);
      } finally {
        setLoading(false);
      }
    },
    [enabled],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      analyzeCode(code, problemId);
    }, 5000); // 800ms 디바운싱 (AI 호출이므로 조금 더 길게)

    return () => clearTimeout(timeoutId);
  }, [code, problemId, analyzeCode]);

  return { result, loading, error };
};
