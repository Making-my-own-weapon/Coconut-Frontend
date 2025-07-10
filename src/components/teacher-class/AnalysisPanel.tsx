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
  result: SubmissionResult | null;
  onClose: () => void;
  code: string; // 추가: 에디터 코드
  isSubmitted: boolean; // 추가: 제출 여부
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

const AnalysisContent: React.FC<{ result: SubmissionResult }> = ({ result }) => (
  <div>
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
            <img src={lightbulbIcon} alt="Lightbulb" className="h-5 w-5 mr-2" /> 메모리 사용량
          </div>
          <span className="text-white font-mono">{result.memoryUsageKb} KB</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-slate-300">
            <img src={checkCircleSlateIcon} alt="Check" className="h-5 w-5 mr-2" /> 통과 여부
          </div>
          <span className={`font-semibold ${result.isPassed ? 'text-green-400' : 'text-red-400'}`}>
            {result.isPassed ? '성공' : '실패'}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-slate-300">
            <img src={checkCircleGreenIcon} alt="Check" className="h-5 w-5 mr-2" /> 테스트케이스
          </div>
          <span className="text-white font-mono">
            {result.passedTestCount} / {result.totalTestCount}
          </span>
        </div>
      </div>
    </InfoCard>
    {/* AI 개선 제안 카드 등은 일단 숨김 */}
  </div>
);

export const TeacherAnalysisPanel: React.FC<TeacherAnalysisPanelProps> = ({
  isLoading,
  result,
  onClose,
  code,
  isSubmitted,
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
        {isLoading && (
          <div className="h-full flex flex-col items-center justify-center">
            <Spinner />
            <p className="text-slate-400 mt-4">채점 서버가 열심히 일하고 있어요!</p>
          </div>
        )}
        {!isLoading && isSubmitted && result && <AnalysisContent result={result} />}
        {!isLoading && !isSubmitted && <StaticAnalysisReport code={code} />}
        {!isLoading && isSubmitted && !result && (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-400">제출된 코드가 없습니다.</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default TeacherAnalysisPanel;
