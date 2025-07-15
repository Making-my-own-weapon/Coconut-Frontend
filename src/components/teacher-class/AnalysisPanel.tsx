/**
 * @file TeacherAnalysisPanel.tsx
 * @description
 *    - 코드 분석 결과를 표시하는 오른쪽 사이드바 패널(선생님 전용)입니다.
 *    - 모든 상태(로딩, 결과 데이터, 열림/닫힘)는 부모에서 props로 제어합니다.
 *    - "제출 전"에는 에디터 코드의 실시간 정적 분석 결과를 보여주고, "제출 후"에는 서버 결과(result)를 보여줍니다.
 *
 * @props
 *    - `isLoading`: `true`이면 로딩 스피너를, `false`이면 결과를 보여줍니다.
 *    - `result`: 서버로부터 받은 분석 결과 데이터 객체입니다.
 *    - `onClose`: 패널의 닫기 버튼(×)을 눌렀을 때 호출될 함수입니다.
 *    - `code`: 에디터에 입력 중인 코드(제출 전 실시간 분석용)
 *    - `isSubmitted`: true면 result, false면 code의 정적 분석 결과를 보여줌
 */
import React from 'react';

// --- Asset Imports --- //
import chartBarIcon from '../../assets/chart-bar.svg';
import boltIcon from '../../assets/bolt.svg';
import brainIcon from '../../assets/brain.svg';
import lightbulbIcon from '../../assets/lightbulb.svg';
import checkCircleGreenIcon from '../../assets/check-circle-green.svg';
import checkCircleSlateIcon from '../../assets/check-circle-slate.svg';
import exclamationTriangleIcon from '../../assets/exclamation-triangle.svg';
import type { SubmissionResult } from '../../api/submissionApi';
import type { DetailedAnalysisResponse } from '../../api/detailedAnalysisApi';
import StaticAnalysisReport from '../analysis/StaticAnalysisReport';

// --- Type Definitions --- //
// 기존 AnalysisResult 타입은 현재 API 응답과 맞지 않으므로 주석 처리 또는 삭제
/*
interface AnalysisResult {
  // ... 기존 복잡한 타입
}
*/

interface TeacherAnalysisPanelProps {
  isLoading: boolean;
  isAnalyzing?: boolean; // 상세 분석 로딩 상태 추가
  result: SubmissionResult | null;
  detailedAnalysis?: DetailedAnalysisResponse | null; // 상세 분석 결과 추가
  onClose: () => void;
  code: string; // 추가: 에디터 코드
  isSubmitted: boolean; // 추가: 제출 여부
  problemId?: string; // 추가: 문제 ID
}

const InfoCard: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode }> = ({
  title,
  children,
  icon,
}) => (
  <div className="bg-slate-800 rounded-lg p-4 mb-4">
    <div className="flex items-center text-white font-bold mb-3">
      {icon}
      <h3 className="text-md">{title}</h3>
    </div>
    {children}
  </div>
);

export const TeacherAnalysisPanel: React.FC<TeacherAnalysisPanelProps> = ({
  isLoading,
  isAnalyzing = false,
  result,
  detailedAnalysis,
  onClose,
  code,
  isSubmitted,
  problemId,
}) => {
  const Spinner = () => (
    <svg
      className="animate-spin h-8 w-8 text-blue-400"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );

  return (
    <aside
      className="fixed right-0 z-50 w-[380px] bg-slate-900 border-l border-slate-700 flex flex-col transition-all duration-300"
      style={{ top: '64px', height: 'calc(100vh - 64px)' }}
    >
      <div className="flex justify-between items-center p-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white">분석 리포트</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl font-bold">
          &times;
        </button>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        {/* 제출 중 로딩 */}
        {isLoading && (
          <div className="h-full flex flex-col items-center justify-center">
            <Spinner />
            <p className="text-slate-400 mt-4">코드를 제출하고 있습니다...</p>
          </div>
        )}

        {/* 제출 완료 후 결과 표시 */}
        {!isLoading && isSubmitted && (
          <div className="space-y-4">
            {/* 채점 결과 */}
            {result ? (
              <InfoCard
                title="채점 결과"
                icon={<img src={chartBarIcon} alt="Chart" className="h-5 w-5 mr-2" />}
              >
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-slate-300">
                      <img src={brainIcon} alt="Brain" className="h-5 w-5 mr-2" /> 실행 시간
                    </div>
                    <span className="text-white font-mono">{result.executionTimeMs} ms</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-slate-300">
                      <img src={lightbulbIcon} alt="Lightbulb" className="h-5 w-5 mr-2" /> 메모리
                      사용량
                    </div>
                    <span className="text-white font-mono">{result.memoryUsageKb} KB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-slate-300">
                      <img src={checkCircleSlateIcon} alt="Check" className="h-5 w-5 mr-2" /> 통과
                      여부
                    </div>
                    <span
                      className={`font-semibold ${result.isPassed ? 'text-green-400' : 'text-red-400'}`}
                    >
                      {result.isPassed ? '성공' : '실패'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-slate-300">
                      <img src={checkCircleGreenIcon} alt="Check" className="h-5 w-5 mr-2" />{' '}
                      테스트케이스
                    </div>
                    <span className="text-white font-mono">
                      {result.passedTestCount} / {result.totalTestCount}
                    </span>
                  </div>
                </div>
              </InfoCard>
            ) : (
              <InfoCard
                title="채점 결과"
                icon={<img src={chartBarIcon} alt="Chart" className="h-5 w-5 mr-2" />}
              >
                <div className="flex items-center justify-center p-4">
                  <Spinner />
                  <p className="text-slate-400 ml-3">채점 중...</p>
                </div>
              </InfoCard>
            )}

            {/* AI 상세 분석 */}
            <InfoCard
              title="AI 상세 분석"
              icon={<img src={brainIcon} alt="AI Analysis" className="h-5 w-5 mr-2" />}
            >
              {isAnalyzing && (
                <div className="flex items-center justify-center p-4">
                  <Spinner />
                  <p className="text-slate-400 ml-3">AI가 코드를 분석하고 있습니다...</p>
                </div>
              )}

              {!isAnalyzing && detailedAnalysis && (
                <div className="space-y-4">
                  {/* 접근 방식 */}
                  <div>
                    <h4 className="text-sm font-semibold text-blue-300 mb-2">🎯 접근 방식</h4>
                    <div className="bg-blue-900/20 rounded-lg border border-blue-700 p-3">
                      <p className="text-blue-400 text-sm">{detailedAnalysis.analysis.approach}</p>
                    </div>
                  </div>

                  {/* 장점 */}
                  <div>
                    <h4 className="text-sm font-semibold text-green-300 mb-2">✅ 좋은 점</h4>
                    <div className="bg-green-900/20 rounded-lg border border-green-700 p-3">
                      <p className="text-green-400 text-sm">{detailedAnalysis.analysis.pros}</p>
                    </div>
                  </div>

                  {/* 개선점 */}
                  <div>
                    <h4 className="text-sm font-semibold text-yellow-300 mb-2">⚠️ 개선점</h4>
                    <div className="bg-yellow-900/20 rounded-lg border border-yellow-700 p-3">
                      <p className="text-yellow-400 text-sm">{detailedAnalysis.analysis.cons}</p>
                    </div>
                  </div>

                  {/* 종합 추천 */}
                  <div>
                    <h4 className="text-sm font-semibold text-purple-300 mb-2">💡 종합 추천</h4>
                    <div className="bg-purple-900/20 rounded-lg border border-purple-700 p-3">
                      <p className="text-purple-400 text-sm">{detailedAnalysis.recommendation}</p>
                    </div>
                  </div>
                </div>
              )}

              {!isAnalyzing && !detailedAnalysis && (
                <div className="flex items-center justify-center p-4">
                  <p className="text-slate-400 text-sm">AI 분석을 완료할 수 없습니다.</p>
                </div>
              )}
            </InfoCard>
          </div>
        )}

        {/* 제출 전 실시간 분석 */}
        {!isLoading && !isSubmitted && <StaticAnalysisReport code={code} problemId={problemId} />}

        {/* 제출 후 결과 없음 */}
        {!isLoading && isSubmitted && !result && !isAnalyzing && (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-400">제출된 코드가 없습니다.</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default TeacherAnalysisPanel;
