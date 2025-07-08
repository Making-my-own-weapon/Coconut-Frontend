/**
 * @file AnalysisPanel.tsx
 * @description
 *    - 코드 분석 결과를 표시하는 오른쪽 사이드바 패널입니다.
 *    - submissionStore에서 직접 상태를 구독합니다.
 */
import React from 'react';
import { useSubmissionStore } from '../../store/submissionStore';
import type { SubmissionResult } from '../../api/submissionApi';

// --- Asset Imports --- //
import chartBarIcon from '../../assets/chart-bar.svg';
import boltIcon from '../../assets/bolt.svg';
import brainIcon from '../../assets/brain.svg';
import lightbulbIcon from '../../assets/lightbulb.svg';
import checkCircleGreenIcon from '../../assets/check-circle-green.svg';
import checkCircleSlateIcon from '../../assets/check-circle-slate.svg';
import exclamationTriangleIcon from '../../assets/exclamation-triangle.svg';

// --- Props --- //
interface AnalysisPanelProps {
  onClose: () => void;
}

// --- Sub-components --- //
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

// 실제 백엔드 응답 데이터(SubmissionResult)를 UI로 렌더링하는 컴포넌트
const AnalysisContent: React.FC<{ result: SubmissionResult }> = ({ result }) => (
  <div>
    {/* 실행 결과 카드 */}
    <InfoCard
      title={`제출 결과 #${result.submissionId}`}
      icon={<img src={chartBarIcon} alt="Chart" className="h-5 w-5 mr-2" />}
    >
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center text-slate-300">
            <img src={brainIcon} alt="Brain" className="h-5 w-5 mr-2" /> 실행 시간
          </div>
          <span className="text-white font-mono">{result.executionTimeMs}ms</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-slate-300">
            <img src={lightbulbIcon} alt="Lightbulb" className="h-5 w-5 mr-2" /> 사용된 메모리양
          </div>
          <span className="text-white font-mono">{result.memoryUsageKb}KB</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-slate-300">
            <img src={checkCircleSlateIcon} alt="Check" className="h-5 w-5 mr-2" /> 테스트 통과
          </div>
          <span className="text-white font-mono">
            {result.passedTestCount}/{result.totalTestCount}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center text-slate-300">
            <img src={checkCircleSlateIcon} alt="Check" className="h-5 w-5 mr-2" /> 결과
          </div>
          <span className={`font-semibold ${result.isPassed ? 'text-green-400' : 'text-red-400'}`}>
            {result.status}
          </span>
        </div>
      </div>
    </InfoCard>

    {/* 결과 메시지 카드 */}
    <InfoCard title="채점 결과" icon={<img src={boltIcon} alt="Bolt" className="h-5 w-5 mr-2" />}>
      <div className="p-3 rounded-md bg-slate-700/50">
        <p className="text-white text-sm">{result.output}</p>
      </div>
    </InfoCard>
  </div>
);

// --- Main Component --- //
export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ onClose }) => {
  // 스토어에서 직접 구독
  const { isSubmitting, analysisResult, closeAnalysis } = useSubmissionStore();

  const handleClose = () => {
    closeAnalysis();
    onClose();
  };

  // 로딩 스피너 컴포넌트
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
        <h2 className="text-xl font-bold text-white">분석 리포트</h2>
        <button
          onClick={handleClose}
          className="text-slate-400 hover:text-white text-2xl font-bold"
        >
          &times;
        </button>
      </div>

      <div className="flex-grow p-4 overflow-y-auto">
        {/* 스토어 상태에 따라 조건부 렌더링 */}
        {/* Case 1: 로딩 중 */}
        {isSubmitting && (
          <div className="h-full flex flex-col items-center justify-center">
            <Spinner />
            <p className="text-slate-400 mt-4">AI가 학생의 코드를 분석 중입니다...</p>
          </div>
        )}
        {/* Case 2: 결과 데이터가 있을 때 */}
        {!isSubmitting && analysisResult && <AnalysisContent result={analysisResult} />}
        {/* Case 3: 결과 데이터가 없을 때 (초기 상태) */}
        {!isSubmitting && !analysisResult && (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-400">제출된 코드가 없습니다.</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AnalysisPanel;
