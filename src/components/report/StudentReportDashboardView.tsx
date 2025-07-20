import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacherStore } from '../../store/teacherStore';
import { Save, LogOut } from 'lucide-react';
import ReportLayout from './ReportLayout';
import { BoxReportStudent } from './index';
import type { StudentMetric } from './index';
import { BoardReportBox } from './index';
import type { CategoryData, ProblemAnalysisData } from './index';
import StudentReportView from './StudentReportView';
import { saveReport } from '../../api/reportApi';
import { showToast } from '../../utils/sweetAlert';

interface StudentReportDashboardViewProps {
  roomTitle?: string;
  studentMetrics?: StudentMetric[];
  categoryData?: CategoryData[];
  problemAnalysisData?: ProblemAnalysisData[];
  className?: string;
  // 상세분석을 위한 추가 props
  reportData?: any;
  currentStudentName?: string;
  roomId?: string; // 리포트 저장을 위한 roomId 추가
}

const StudentReportDashboardView: React.FC<StudentReportDashboardViewProps> = ({
  roomTitle: propRoomTitle,
  studentMetrics,
  categoryData,
  problemAnalysisData,
  className = '',
  reportData,
  currentStudentName,
  roomId,
}) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  // Store에서 현재 수업 정보 가져오기
  const { currentRoom, createdRoomInfo } = useTeacherStore();

  const handleSaveReport = async () => {
    if (!roomId) {
      showToast('error', '방 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      const result = await saveReport(roomId);
      if (result.success) {
        showToast('success', '리포트가 성공적으로 저장되었습니다!');
      } else {
        showToast('error', result.message || '리포트 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('리포트 저장 오류:', error);
      showToast('error', '리포트 저장 중 오류가 발생했습니다.');
    }
  };

  const handleLeaveClass = () => {
    navigate('/');
  };

  // 수업 이름 결정
  const roomTitle = propRoomTitle || currentRoom?.title || createdRoomInfo?.title || '수업 리포트';

  // 탭 컴포넌트
  const tabs = (
    <div className="flex gap-2">
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

  // 액션 버튼들 (학생용으로 수정)
  const actions = (
    <>
      <button
        onClick={handleSaveReport}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-md text-white font-medium hover:from-emerald-700 hover:to-emerald-800 transition-colors"
      >
        <Save className="w-5 h-5" /> 리포트 저장
      </button>
      <button
        onClick={handleLeaveClass}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-md text-white font-medium hover:from-red-700 hover:to-red-800 transition-colors"
      >
        <LogOut className="w-5 h-5" /> 수업 나가기
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

  // 상세분석 탭을 위한 학생 데이터 생성
  const generateStudentDataForDetailedView = () => {
    if (!reportData || !currentStudentName) {
      return [];
    }

    const totalProblems = reportData.totalProblems || 1;
    const studentSubmission = reportData.studentSubmissions?.find(
      (submission: any) => submission.name === currentStudentName,
    );

    if (!studentSubmission) {
      return [];
    }

    const correctAnswers = Math.round((studentSubmission.successRate * totalProblems) / 100);

    const result = [
      {
        studentName: currentStudentName,
        correctAnswers: correctAnswers,
        submissions: [],
      },
    ];

    return result;
  };

  return (
    <div className={className}>
      <ReportLayout roomTitle={roomTitle} tabs={tabs} actions={actions} userType="student">
        {activeTab === 'dashboard' ? (
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
        ) : (
          // 상세분석 탭 - StudentReportView와 동일한 UI
          <div className="space-y-8">
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">상세 분석</h2>
                <p className="text-slate-400">문제별 제출 현황과 상세 분석을 확인합니다</p>
              </div>
              <StudentReportView
                studentResults={generateStudentDataForDetailedView()}
                totalProblems={reportData?.totalProblems || 0}
                isStudentView={true}
                currentStudentName={currentStudentName}
              />
            </section>
          </div>
        )}
      </ReportLayout>
    </div>
  );
};

export default StudentReportDashboardView;
