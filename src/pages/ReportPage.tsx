import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReportStore } from '../store/reportStore';
import { useTeacherStore } from '../store/teacherStore';
import ReportLayout from '../components/report/ReportLayout';
import OverallReportView from '../components/report/OverallReportView';
import StudentReportView from '../components/report/StudentReportView';
import { LogOut, Save } from 'lucide-react';
import { showToast } from '../utils/sweetAlert'; //showConfirm 안 써서 지웠다. 『안채호』
import LoadingAnimation from '../components/common/LoadingAnimationCat'; //희희 고양이 『안채호』
import { saveReport } from '../api/reportApi';

const ReportPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState<'overall' | 'student'>('overall');
  const [isReportSaved, setIsReportSaved] = useState(false);

  const { deleteRoom, isLoading: isTeacherLoading } = useTeacherStore();
  const { reportData, fetchReport, isLoading: isReportLoading } = useReportStore(); //isLoading이 겹쳐서 별명을 만들어서 구분해주는 구조 분해 할당 문법을 사용했다. 『안채호』

  useEffect(() => {
    if (roomId) fetchReport(roomId);
  }, [roomId, fetchReport]);

  const handleLeaveRoom = async () => {
    if (roomId) {
      try {
        await deleteRoom(roomId);
        navigate('/join');
      } catch {
        showToast('error', '방 삭제에 실패했습니다.');
      }
    }
  };

  const handleSaveReport = async () => {
    if (isReportSaved) {
      showToast('info', '이미 저장된 리포트입니다.');
      return;
    }

    if (!roomId) {
      showToast('error', '방 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      const result = await saveReport(roomId);
      if (result.success) {
        showToast('success', '리포트가 성공적으로 저장되었습니다!');
        setIsReportSaved(true);
      } else {
        showToast('error', result.message || '리포트 저장에 실패했습니다.');
      }
    } catch (error) {
      console.error('리포트 저장 오류:', error);
      showToast('error', '리포트 저장 중 오류가 발생했습니다.');
    }
  };

  // --- 1. 차트에 필요한 데이터와 옵션을 정의합니다. ---
  const problemChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: '문제별 정답률', color: 'white', font: { size: 20 } },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `정답률: ${context.parsed.y}%`;
          },
        },
      },
    },
    scales: {
      x: { ticks: { color: 'white' } },
      y: {
        ticks: {
          color: 'white',
          callback: function (value: any) {
            return value + '%';
          },
        },
        min: 0,
        max: 100,
      },
    },
  };

  const problemChartData = useMemo(
    () => ({
      labels: reportData?.problemAnalysis?.map((p: any) => p.title) || [],
      datasets: [
        {
          label: '정답률 (%)',
          data: reportData?.problemAnalysis?.map((p: any) => Math.max(p.successRate, 1)) || [], // 0% 데이터도 최소 1로 설정해서 작게라도 표시
          backgroundColor: 'rgba(239, 68, 68, 0.6)',
        },
      ],
    }),
    [reportData],
  );

  const studentChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      title: { display: true, text: '학생별 정답률', color: 'white', font: { size: 20 } },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `정답률: ${context.parsed.x}%`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'white',
          callback: function (value: any) {
            return value + '%';
          },
        },
        min: 0,
        max: 100,
      },
      y: { ticks: { color: 'white' } },
    },
  };

  const studentChartData = useMemo(
    () => ({
      labels: reportData?.studentSubmissions?.map((s: any) => s.name) || [],
      datasets: [
        {
          label: '정답률 (%)',
          data: reportData?.studentSubmissions?.map((s: any) => Math.max(s.successRate, 1)) || [], // 0% 데이터도 최소 1로 설정해서 작게라도 표시
          backgroundColor: 'rgba(234, 179, 8, 0.6)',
        },
      ],
    }),
    [reportData],
  );

  const getButtonClass = (tabName: typeof activeView) =>
    activeView === tabName
      ? 'px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg text-sm font-semibold shadow-lg'
      : 'px-4 py-2 bg-slate-600/50 hover:bg-slate-600 rounded-lg text-sm font-semibold';

  const tabs = (
    <>
      <button onClick={() => setActiveView('overall')} className={getButtonClass('overall')}>
        전체 리포트
      </button>
      <button onClick={() => setActiveView('student')} className={getButtonClass('student')}>
        학생 리포트
      </button>
    </>
  );

  const actionButtons = (
    <>
      <button
        onClick={handleSaveReport}
        className={`flex items-center justify-center gap-2 px-5 py-3 rounded-md text-white font-medium transition-colors ${
          isReportSaved
            ? 'bg-gray-600 hover:bg-gray-700'
            : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
        }`}
      >
        <Save className="w-5 h-5" />
        {isReportSaved ? '이미 저장됨' : '리포트 저장'}
      </button>
      <button
        onClick={handleLeaveRoom}
        disabled={isTeacherLoading} //이거 isLoading 맞다.(티처스토어버전) 『안채호』
        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-md text-white font-medium disabled:opacity-50"
      >
        <LogOut className="w-5 h-5" /> 수업 종료
      </button>
    </>
  );

  // DB에서 받은 리포트 데이터만 사용 (스토어 의존성 제거)
  const studentData = useMemo(() => {
    if (!reportData) return [];

    const studentSubmissions = reportData.studentSubmissions || [];
    const totalProblems = reportData.totalProblems || 1;

    // studentSubmissions에서 직접 학생 데이터 생성 (백엔드에서 이미 학생만 필터링됨)
    return studentSubmissions.map((submission) => {
      // 정답률을 정답 개수로 변환 (전체 문제 수 * 정답률 / 100)
      const correctAnswers = Math.round((submission.successRate * totalProblems) / 100);

      return {
        studentName: submission.name,
        correctAnswers: correctAnswers,
        submissions: [],
      };
    });
  }, [reportData]);

  // 👇 3. isReportLoading 상태를 사용해 로딩 애니메이션을 보여줍니다.
  if (isReportLoading || !reportData) {
    return <LoadingAnimation />;
  }

  return (
    <ReportLayout
      actions={actionButtons}
      tabs={tabs}
      roomTitle={reportData?.roomTitle}
      userType="teacher"
    >
      {activeView === 'overall' && (
        // --- 2. OverallReportView에 모든 props를 전달합니다. ---
        <OverallReportView
          reportData={reportData}
          problemChartOptions={problemChartOptions}
          problemChartData={problemChartData}
          studentChartOptions={studentChartOptions}
          studentChartData={studentChartData}
        />
      )}
      {activeView === 'student' && (
        <StudentReportView
          studentResults={studentData}
          totalProblems={reportData?.totalProblems || 0}
        />
      )}
    </ReportLayout>
  );
};

export default ReportPage;
