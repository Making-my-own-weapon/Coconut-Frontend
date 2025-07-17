import React, { useState } from 'react';
import ReportLayout from './ReportLayout';
import { BoxReportStudent } from './index';
import type { StudentMetric } from './index';
import { BoardReportBox } from './index';
import type { CategoryData, ProblemAnalysisData } from './index';

interface StudentReportDashboardViewProps {
  roomTitle?: string;
  studentMetrics?: StudentMetric[];
  categoryData?: CategoryData[];
  problemAnalysisData?: ProblemAnalysisData[];
  className?: string;
}

const StudentReportDashboardView: React.FC<StudentReportDashboardViewProps> = ({
  roomTitle = '수업 리포트',
  studentMetrics,
  categoryData,
  problemAnalysisData,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // 탭 컴포넌트
  const tabs = (
    <div className="flex bg-slate-800 rounded-lg p-1">
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeTab === 'dashboard'
            ? 'bg-blue-600 text-white'
            : 'text-slate-300 hover:text-white hover:bg-slate-700'
        }`}
      >
        대시보드
      </button>
      <button
        onClick={() => setActiveTab('detailed')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeTab === 'detailed'
            ? 'bg-blue-600 text-white'
            : 'text-slate-300 hover:text-white hover:bg-slate-700'
        }`}
      >
        상세 분석
      </button>
    </div>
  );

  // 액션 버튼들
  const actions = (
    <div className="flex gap-3">
      <button className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-colors">
        PDF 다운로드
      </button>
      <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors">
        공유하기
      </button>
    </div>
  );

  const handleCategoryClick = () => {
    console.log('카테고리 클릭됨');
    // 카테고리 클릭 시 처리 로직
  };

  const handleProblemClick = () => {
    console.log('문제 분석 클릭됨');
    // 문제 분석 클릭 시 처리 로직
  };

  return (
    <div className={className}>
      <ReportLayout roomTitle={roomTitle} tabs={tabs} actions={actions}>
        <div className="space-y-8">
          {/* 학생 성과 메트릭 카드들 */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">학습 성과 요약</h2>
              <p className="text-slate-400">학생의 전반적인 학습 성과를 한눈에 확인하세요</p>
            </div>
            <BoxReportStudent metrics={studentMetrics} className="mb-8" />
          </section>

          {/* 카테고리 및 문제 분석 보드 */}
          <section>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">상세 분석</h2>
              <p className="text-slate-400">카테고리별 성과와 문제 해결 패턴을 분석합니다</p>
            </div>
            <BoardReportBox
              categoryData={categoryData}
              problemAnalysisData={problemAnalysisData}
              onCategoryClick={handleCategoryClick}
              onProblemClick={handleProblemClick}
            />
          </section>
        </div>
      </ReportLayout>
    </div>
  );
};

export default StudentReportDashboardView;
