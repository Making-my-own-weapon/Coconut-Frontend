import { useEffect, useState } from 'react';
import { analyzePythonCodeBlocks, type AnalysisResult } from './staticAnalysis';

export function useStaticAnalysis(code: string) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!code) {
      setResult(null);
      return;
    }
    setLoading(true);
    analyzePythonCodeBlocks(code).then((res) => {
      setResult(res);
      setLoading(false);
    });
  }, [code]);

  return { result, loading };
}
