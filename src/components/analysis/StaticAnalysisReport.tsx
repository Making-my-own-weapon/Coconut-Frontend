import React, { useEffect, useState, useRef } from 'react';
import { useStaticAnalysis } from '../../analysis/useStaticAnalysis';
import { useRealtimeAnalysis } from '../../hooks/useRealtimeAnalysis';
// 존재하지 않는 아이콘들을, 실제로 있는 아이콘으로 대체합니다.
import chartBarIcon from '../../assets/chart-bar.svg';
import lightbulbIcon from '../../assets/lightbulb.svg';
import checkCircleGreenIcon from '../../assets/check-circle-green.svg';
import exclamationTriangleIcon from '../../assets/exclamation-triangle.svg';
import brainIcon from '../../assets/brain.svg';

interface StaticAnalysisReportProps {
  code: string;
  problemId?: string; // 문제 ID 추가
}

const StaticAnalysisReport: React.FC<StaticAnalysisReportProps> = ({ code, problemId }) => {
  const { result, loading } = useStaticAnalysis(code);
  const {
    result: aiResult,
    loading: aiLoading,
    error: aiError,
  } = useRealtimeAnalysis({
    code,
    problemId,
    enabled: code.trim().length > 10, // 코드가 10자 이상일 때만 AI 분석 활성화
  });

  // 최소 0.5초 로딩 유지 (0.5초보다 빠르면 0.5초, 느리면 바로 결과)
  const [showAiLoading, setShowAiLoading] = useState(false);
  const loadingStartRef = useRef<number | null>(null);
  useEffect(() => {
    if (aiLoading) {
      setShowAiLoading(true);
      loadingStartRef.current = Date.now();
    } else {
      const elapsed = Date.now() - (loadingStartRef.current ?? Date.now());
      const remain = 500 - elapsed;
      if (remain > 0) {
        const timer = setTimeout(() => setShowAiLoading(false), remain);
        return () => clearTimeout(timer);
      } else {
        setShowAiLoading(false);
      }
    }
  }, [aiLoading]);

  // 이전 분석 결과를 로딩 중에도 유지
  const [lastResult, setLastResult] = useState<any>(null);
  useEffect(() => {
    if (result && !loading) setLastResult(result);
  }, [result, loading]);
  const displayResult = loading ? lastResult : result;

  // 패널 전체는 항상 렌더링, 내부에서 상태 전환
  let mainResult = null;
  let functions: any[] = [];
  let global: any = {};
  let overall: any = {};
  let syntaxErrors: any[] = [];
  if (displayResult) {
    functions = displayResult.functions || [];
    global = displayResult.global || {};
    overall = displayResult.overall || {};
    mainResult = functions.length > 0 ? functions[0] : global;
    syntaxErrors = global.errors || [];
  }

  return (
    <div className="flex flex-col items-start gap-3 self-stretch w-full min-h-[420px]">
      {/* 코드 품질 지표 카드 */}
      <div
        className="flex flex-col items-center gap-3 pt-6 pb-6 px-1 relative self-stretch w-full bg-slate-700 rounded-lg border border-solid border-slate-600 shadow-sm"
        style={{ minHeight: '300px' }}
      >
        <div className="flex w-full items-center relative px-4">
          <img className="w-4 h-4 mr-2" alt="Frame" src={chartBarIcon} />
          <h3 className="text-white font-bold">코드 품질 지표</h3>
        </div>
        <div className="flex flex-col items-start gap-3 pt-4 pb-2 px-6 relative self-stretch w-full border-t border-slate-600">
          {!displayResult ? (
            <div className="p-4 text-slate-400">코드를 입력하면 실시간으로 분석됩니다.</div>
          ) : (
            <>
              <div className="flex items-start justify-around gap-3 relative self-stretch w-full">
                <div className="flex flex-col items-center flex-1">
                  <div className="text-slate-400 text-sm">시간 복잡도</div>
                  <div className="font-bold text-white text-sm transition-all duration-300">
                    {overall.worstTimeComplexity}
                  </div>
                </div>
                <div className="flex flex-col items-center flex-1">
                  <div className="text-slate-400 text-sm">공간 복잡도</div>
                  <div className="font-bold text-white text-sm transition-all duration-300">
                    {overall.worstSpaceComplexity}
                  </div>
                </div>
              </div>
              <div className="w-full pt-3 border-t border-slate-600 mt-3">
                <h4 className="text-sm font-semibold text-slate-300 mb-2">문법 오류:</h4>
                <div className="min-h-[20px] transition-all duration-300">
                  {syntaxErrors && syntaxErrors.length > 0 ? (
                    syntaxErrors.map((err: string, i: number) => (
                      <p key={i} className="text-red-400 text-xs font-mono break-words">
                        - {err}
                      </p>
                    ))
                  ) : (
                    <p className="text-green-400 text-sm">문법 오류 없음</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* AI 실시간 분석 카드 */}
      <div className="flex flex-col items-center gap-3 pt-6 pb-6 px-1 relative self-stretch w-full bg-slate-700 rounded-lg border border-solid border-slate-600 shadow-sm min-h-[240px]">
        <div className="flex w-full items-center relative px-4">
          <img className="w-4 h-4 mr-2" alt="AI Hint" src={brainIcon} />
          <h3 className="text-white font-bold">AI 실시간 분석</h3>
          {aiLoading && (
            <div className="ml-2 w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>
        <div className="flex flex-col items-start gap-3 pt-4 pb-2 px-6 relative self-stretch w-full border-t border-slate-600 min-h-[120px]">
          <div className="w-full transition-all duration-300 ease-in-out">
            {/* 로딩 상태 */}
            {showAiLoading ? (
              <div className="flex items-center justify-center p-4 w-full opacity-100 transition-opacity duration-300">
                <p className="text-slate-400 text-sm">AI가 코드를 분석하고 있습니다...</p>
              </div>
            ) : aiError ? (
              <div className="flex items-start p-3 relative self-stretch w-full bg-red-900/20 rounded-lg border border-solid border-red-700 opacity-100 transition-opacity duration-300">
                <img
                  className="w-4 h-4 mr-2 mt-1 shrink-0"
                  alt="Error"
                  src={exclamationTriangleIcon}
                />
                <p className="flex-1 text-red-400 text-sm">
                  AI 분석 중 오류가 발생했습니다: {aiError}
                </p>
              </div>
            ) : aiResult ? (
              <div className="space-y-3 opacity-100 transition-opacity duration-300">
                {/* AI 힌트들 */}
                {aiResult.realtime_hints && aiResult.realtime_hints.length > 0 && (
                  <div className="w-full space-y-2">
                    <h4 className="text-sm font-semibold text-yellow-300 mb-2">💡 실시간 힌트:</h4>
                    {aiResult.realtime_hints.map((hint: string, i: number) => (
                      <div
                        key={i}
                        className="flex items-start p-3 relative self-stretch w-full bg-yellow-900/20 rounded-lg border border-solid border-yellow-700"
                      >
                        <img
                          className="w-4 h-4 mr-2 mt-1 shrink-0"
                          alt="Hint"
                          src={lightbulbIcon}
                        />
                        <p className="flex-1 text-yellow-400 text-sm">{hint}</p>
                      </div>
                    ))}
                  </div>
                )}
                {/* 접근 방식 분석 */}
                {aiResult.analysis?.approach && (
                  <div className="w-full mt-3">
                    <h4 className="text-sm font-semibold text-blue-300 mb-2">🎯 접근 방식:</h4>
                    <div className="flex items-start p-3 relative self-stretch w-full bg-blue-900/20 rounded-lg border border-solid border-blue-700">
                      <img
                        className="w-4 h-4 mr-2 mt-1 shrink-0"
                        alt="Analysis"
                        src={checkCircleGreenIcon}
                      />
                      <p className="flex-1 text-blue-400 text-sm">{aiResult.analysis.approach}</p>
                    </div>
                  </div>
                )}
                {/* 종합 추천 */}
                {aiResult.recommendation && (
                  <div className="w-full mt-3">
                    <h4 className="text-sm font-semibold text-blue-300 mb-2">📋 종합 피드백:</h4>
                    <div className="flex items-start p-3 relative self-stretch w-full bg-blue-900/20 rounded-lg border border-solid border-blue-700">
                      <img
                        className="w-4 h-4 mr-2 mt-1 shrink-0"
                        alt="Recommendation"
                        src={exclamationTriangleIcon}
                      />
                      <p className="flex-1 text-blue-400 text-sm">{aiResult.recommendation}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : !problemId ? (
              <div className="flex items-center justify-center p-4 w-full opacity-100 transition-opacity duration-300">
                <p className="text-slate-400 text-sm">문제를 선택하면 AI 분석이 활성화됩니다.</p>
              </div>
            ) : code.trim().length > 0 ? (
              <div className="flex items-center justify-center p-4 w-full opacity-100 transition-opacity duration-300">
                <p className="text-slate-400 text-sm">코드를 더 작성하면 AI 분석이 시작됩니다.</p>
              </div>
            ) : (
              <div className="flex items-center justify-center p-4 w-full opacity-100 transition-opacity duration-300">
                <p className="text-slate-400 text-sm">
                  코드를 입력하면 AI가 실시간으로 분석합니다.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaticAnalysisReport;
