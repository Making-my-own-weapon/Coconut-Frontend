import React, { useState } from 'react';
import { useTeacherStore } from '../../store/teacherStore';
import { Save, LogOut } from 'lucide-react';
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
  roomTitle: propRoomTitle,
  studentMetrics,
  categoryData,
  problemAnalysisData,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Store에서 현재 수업 정보 가져오기
  const { currentRoom, createdRoomInfo } = useTeacherStore();

  // 수업 이름 결정
  const roomTitle = propRoomTitle || currentRoom?.title || createdRoomInfo?.title || '수업 리포트';

  // 탭 컴포넌트
  const tabs = (
    <div className="flex gap-4">
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeTab === 'dashboard'
            ? 'bg-blue-600 text-white'
            : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
        }`}
      >
        대시보드
      </button>
      <button
        onClick={() => setActiveTab('detailed')}
        className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
          activeTab === 'detailed'
            ? 'bg-blue-600 text-white'
            : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
        }`}
      >
        상세 분석
      </button>
    </div>
  );

  // 액션 버튼들
  const actions = (
    <>
      <button
        onClick={() => console.log('리포트 저장')}
        className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-md text-white font-medium"
      >
        <Save className="w-5 h-5" /> 리포트 저장
      </button>
      <button
        onClick={() => console.log('수업 종료')}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-md text-white font-medium"
      >
        <LogOut className="w-5 h-5" /> 수업 종료
      </button>
    </>
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
      <ReportLayout roomTitle={roomTitle} tabs={tabs} actions={actions} userType="student">
        <div className="space-y-8">
          {/* 학생 성과 메트릭 카드들 */}
          <section>
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
