/**
 * @file TeacherAnalysisPanel.tsx
 * @description
 *    - 코드 분석 결과를 표시하는 오른쪽 사이드바 패널(선생님 전용)입니다.
 *    - 모든 상태(로딩, 결과 데이터, 열림/닫힘)는 부모에서 props로 제어합니다.
 *
 * @props
 *    - `isLoading`: `true`이면 로딩 스피너를, `false`이면 결과를 보여줍니다.
 *    - `result`: 서버로부터 받은 분석 결과 데이터 객체입니다.
 *    - `onClose`: 패널의 닫기 버튼(×)을 눌렀을 때 호출될 함수입니다.
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

// --- Type Definitions --- //
interface AnalysisResult {
  progress: {
    percentage: number;
    tests: string;
    time: string;
  };
  aiSuggestions: {
    type: 'performance' | 'optimization' | 'best-practice';
    title: string;
    line?: number;
  }[];
  execution: {
    problemTitle: string;
    time: string;
    memory: string;
    status: 'success' | 'fail';
  };
  complexity: {
    time: string;
    space: string;
    cyclomatic: number;
    loc: number;
  };
  quality: {
    efficiency: number;
    readability: number;
  };
  performanceImprovements: string[];
}

interface TeacherAnalysisPanelProps {
  isLoading: boolean;
  result: AnalysisResult | null;
  onClose: () => void;
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

const AnalysisContent: React.FC<{ result: AnalysisResult }> = ({ result }) => (
  <div>
    {/* 실행 결과 카드 */}
    <InfoCard
      title={result.execution.problemTitle}
      icon={<img src={chartBarIcon} alt="Chart" className="h-5 w-5 mr-2" />}
    >
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center text-slate-300">
            <img src={brainIcon} alt="Brain" className="h-5 w-5 mr-2" /> 실행 시간
          </div>
          <span className="text-white font-mono">{result.execution.time}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-slate-300">
            <img src={lightbulbIcon} alt="Lightbulb" className="h-5 w-5 mr-2" /> 사용된 메모리양
          </div>
          <span className="text-white font-mono">{result.execution.memory}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-slate-300">
            <img src={checkCircleSlateIcon} alt="Check" className="h-5 w-5 mr-2" /> 결과
          </div>
          <span
            className={`font-semibold ${result.execution.status === 'success' ? 'text-green-400' : 'text-red-400'}`}
          >
            {result.execution.status.toUpperCase()}
          </span>
        </div>
      </div>
    </InfoCard>
    {/* AI 개선 제안 카드 */}
    <InfoCard
      title="AI 개선 제안"
      icon={<img src={boltIcon} alt="Bolt" className="h-5 w-5 mr-2" />}
    >
      {result.aiSuggestions.map((suggestion, index) => (
        <div key={index} className="flex items-start p-3 rounded-md mb-2 bg-slate-700/50">
          {suggestion.type === 'performance' && (
            <img src={exclamationTriangleIcon} alt="Warning" className="h-6 w-6" />
          )}
          {suggestion.type === 'optimization' && (
            <img src={boltIcon} alt="Optimization" className="h-6 w-6 text-blue-400" />
          )}
          {suggestion.type === 'best-practice' && (
            <img src={checkCircleGreenIcon} alt="Best Practice" className="h-6 w-6" />
          )}
          <div className="ml-3">
            <p className="text-white text-sm">{suggestion.title}</p>
            {suggestion.line && (
              <span className="text-xs text-slate-400">Line {suggestion.line}</span>
            )}
          </div>
        </div>
      ))}
    </InfoCard>
  </div>
);

export const TeacherAnalysisPanel: React.FC<TeacherAnalysisPanelProps> = ({
  isLoading,
  result,
  onClose,
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
    <aside className="w-[380px] h-full bg-slate-900 border-l border-slate-700 flex flex-col transition-all duration-300">
      <div className="flex justify-between items-center p-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white">분석 리포트(선생님)</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl font-bold">
          &times;
        </button>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        {isLoading && (
          <div className="h-full flex flex-col items-center justify-center">
            <Spinner />
            <p className="text-slate-400 mt-4">AI가 선생님의 코드를 분석 중입니다...</p>
          </div>
        )}
        {!isLoading && result && <AnalysisContent result={result} />}
        {!isLoading && !result && (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-400">제출된 코드가 없습니다.</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default TeacherAnalysisPanel;
