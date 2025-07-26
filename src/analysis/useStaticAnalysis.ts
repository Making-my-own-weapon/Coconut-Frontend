import { useState, useEffect, useCallback } from 'react';
import { analyzeCodeComplexity } from './complexityAnalyzer';
import { checkSyntaxErrors } from './syntaxChecker';

export interface AnalysisResult {
  functions: FunctionAnalysis[];
  global: GlobalAnalysis;
  overall: OverallAnalysis;
}

export interface FunctionAnalysis {
  name: string;
  timeComplexity: string;
  spaceComplexity: string;
  errors: string[];
  suggestions: string[];
  lineNumber: number;
}

export interface GlobalAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  errors: string[];
  suggestions: string[];
}

export interface OverallAnalysis {
  worstTimeComplexity: string;
  worstSpaceComplexity: string;
  totalErrors: number;
  totalFunctions: number;
  codeQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export const useStaticAnalysis = (code: string) => {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeCode = useCallback(async (sourceCode: string) => {
    if (!sourceCode.trim()) {
      setResult(null);
      return;
    }

    setLoading(true);
    try {
      // 문법 오류 검사
      const syntaxErrors = await checkSyntaxErrors(sourceCode);

      // 복잡도 분석
      const complexityResult = await analyzeCodeComplexity(sourceCode);

      // 전체 분석 결과 생성
      const analysisResult: AnalysisResult = {
        functions: complexityResult.functions,
        global: {
          timeComplexity: complexityResult.global.timeComplexity,
          spaceComplexity: complexityResult.global.spaceComplexity,
          errors: syntaxErrors,
          suggestions: complexityResult.global.suggestions,
        },
        overall: {
          worstTimeComplexity: complexityResult.overall.worstTimeComplexity,
          worstSpaceComplexity: complexityResult.overall.worstSpaceComplexity,
          totalErrors: syntaxErrors.length,
          totalFunctions: complexityResult.functions.length,
          codeQuality: calculateCodeQuality(complexityResult, syntaxErrors.length),
        },
      };

      setResult(analysisResult);
    } catch (error) {
      console.error('코드 분석 중 오류 발생:', error);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      analyzeCode(code);
    }, 500); // 500ms 디바운스

    return () => clearTimeout(timeoutId);
  }, [code, analyzeCode]);

  return { result, loading };
};

const calculateCodeQuality = (
  complexityResult: any,
  errorCount: number,
): 'excellent' | 'good' | 'fair' | 'poor' => {
  if (errorCount > 0) return 'poor';

  const worstTime = complexityResult.overall.worstTimeComplexity;
  const worstSpace = complexityResult.overall.worstSpaceComplexity;

  // O(1), O(log n), O(n)은 좋은 품질
  if (worstTime === 'O(1)' || worstTime === 'O(log n)' || worstTime === 'O(n)') {
    return 'excellent';
  }

  // O(n log n)은 양호한 품질
  if (worstTime === 'O(n log n)') {
    return 'good';
  }

  // O(n²)은 보통 품질
  if (worstTime === 'O(n²)') {
    return 'fair';
  }

  // O(2ⁿ), O(n!) 등은 나쁜 품질
  return 'poor';
};
