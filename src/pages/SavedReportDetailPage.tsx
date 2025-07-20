import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StudentReportDashboardView } from '../components/report';
import OverallReportView from '../components/report/OverallReportView';
import StudentReportView from '../components/report/StudentReportView';
import ReportLayout from '../components/report/ReportLayout';
import { getSavedReportDetail } from '../api/reportApi';
import { useAuthStore } from '../store/authStore';
import { showToast } from '../utils/sweetAlert';
import { ArrowLeft } from 'lucide-react';

interface SavedReportDetail {
  id: number;
  user_id: number;
  room_title: string;
  report_data: any;
  saved_at: string;
  report_type: 'teacher' | 'student';
}

const SavedReportDetailPage = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [savedReport, setSavedReport] = useState<SavedReportDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<'overall' | 'student'>('overall');
  const navigate = useNavigate();

  // 현재 사용자 정보 가져오기
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchSavedReport = async () => {
      if (!reportId) return;

      try {
        setIsLoading(true);
        const response = await getSavedReportDetail(Number(reportId));

        if (response.success && response.data) {
          setSavedReport(response.data);
        } else {
          showToast('error', response.message || '저장된 리포트를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('저장된 리포트를 가져오는데 실패했습니다:', error);
        showToast('error', '저장된 리포트를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedReport();
  }, [reportId]);

  // 저장된 리포트 데이터에서 필요한 정보 추출
  const reportData = savedReport?.report_data;

  // 학생 메트릭 데이터 생성 (학생 리포트용)
  const studentMetrics = reportData
    ? [
        {
          type: 'accuracy' as const,
          title: '정답률',
          value: `${reportData.averageSuccessRate}%`,
        },
        {
          type: 'firstPass' as const,
          title: '첫 제출에 통과한 문제',
          value: `${(reportData as any).firstSubmissionPassed || 0} 개`,
        },
        {
          type: 'bestCategory' as const,
          title: '가장 많이 통과한 카테고리',
          value: (reportData as any).bestCategory?.name || '데이터 없음',
        },
        {
          type: 'worstCategory' as const,
          title: '가장 어려웠던 카테고리',
          value: (reportData as any).worstCategory?.name || '데이터 없음',
        },
      ]
    : undefined;

  // 문제 분석 데이터 (실제 submission 데이터에서 생성)
  const problemAnalysisData = React.useMemo(() => {
    if (!reportData || !user?.name) return undefined;

    const allSubmissions = (reportData as any).submissions || [];
    const userSubmissions = allSubmissions.filter(
      (submission: any) => submission.user?.name === user.name,
    );

    // 통과/실패 분류
    const passedCount = userSubmissions.filter((sub: any) => sub.is_passed).length;
    const failedSubmissions = userSubmissions.filter((sub: any) => !sub.is_passed);

    // 실패한 제출들의 stdout 값들을 수집하고 그룹핑
    const stdoutGroups: { [key: string]: number } = {};

    failedSubmissions.forEach((submission: any) => {
      let stdout = submission.stdout || '알 수 없는 오류';

      // stdout이 너무 길면 첫 줄만 사용 (에러의 핵심 부분)
      const firstLine = stdout.split('\n')[0].trim();
      if (firstLine.length > 0) {
        stdout = firstLine;
      }

      // 너무 긴 메시지는 줄임 (50자 제한)
      if (stdout.length > 50) {
        stdout = stdout.substring(0, 50) + '...';
      }

      // 빈 stdout는 '실행 오류'로 처리
      if (!stdout || stdout.trim() === '') {
        stdout = '실행 오류';
      }

      stdoutGroups[stdout] = (stdoutGroups[stdout] || 0) + 1;
    });

    // 결과 배열 생성 (통과 + 실패 원인들)
    const result = [];

    // 통과한 경우 추가
    if (passedCount > 0) {
      result.push({
        name: '통과',
        count: passedCount,
      });
    }

    // 실패 원인들을 개수 순으로 정렬해서 추가 (최대 5개)
    const failedReasons = Object.entries(stdoutGroups)
      .sort(([, countA], [, countB]) => countB - countA) // 개수가 많은 순으로 정렬
      .slice(0, 5) // 최대 5개만
      .map(([reason, count]) => ({
        name: reason,
        count: count,
      }));

    result.push(...failedReasons);

    return result.length > 0 ? result : undefined;
  }, [reportData, user?.name]);

  // 카테고리 데이터
  const categoryData = (reportData as any)?.categoryAnalysis?.map((category: any) => ({
    name: category.name,
    count: category.uniqueProblems || 0, // 카테고리별 문제 수
    successRate: category.successRate, // 정답률은 별도 보관
    passedCount: category.passedSubmissions, // 맞춘 개수
    totalCount: category.totalSubmissions, // 총 제출 개수
    uniqueProblems: category.uniqueProblems, // 고유 문제 수
    problemTitles: category.problemTitles, // 포함된 문제들
    participatingStudents: category.participatingStudents, // 참여 학생 수
    firstSubmissionSuccessRate: category.firstSubmissionSuccessRate, // 첫 제출 성공률
  }));

  // 선생님 리포트용 차트 데이터 생성
  const problemChartOptions = React.useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y' as const,
      plugins: {
        legend: { display: false },
        title: { display: true, text: '문제별 정답률', color: 'white', font: { size: 20 } },
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
    }),
    [],
  );

  const problemChartData = React.useMemo(
    () => ({
      labels: reportData?.problemAnalysis?.map((p: any) => p.title) || [],
      datasets: [
        {
          label: '정답률 (%)',
          data: reportData?.problemAnalysis?.map((p: any) => Math.max(p.successRate, 1)) || [],
          backgroundColor: 'rgba(239, 68, 68, 0.6)',
        },
      ],
    }),
    [reportData],
  );

  const studentChartOptions = React.useMemo(
    () => ({
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
    }),
    [],
  );

  const studentChartData = React.useMemo(
    () => ({
      labels: reportData?.studentSubmissions?.map((s: any) => s.name) || [],
      datasets: [
        {
          label: '정답률 (%)',
          data: reportData?.studentSubmissions?.map((s: any) => Math.max(s.successRate, 1)) || [],
          backgroundColor: 'rgba(234, 179, 8, 0.6)',
        },
      ],
    }),
    [reportData],
  );

  // 학생 데이터 생성 (선생님 리포트용)
  const studentData = React.useMemo(() => {
    if (!reportData) return [];

    const studentSubmissions = reportData.studentSubmissions || [];
    const totalProblems = reportData.totalProblems || 1;

    // studentSubmissions에서 직접 학생 데이터 생성 (백엔드에서 이미 학생만 필터링됨)
    return studentSubmissions.map((submission: any) => {
      // 정답률을 정답 개수로 변환 (전체 문제 수 * 정답률 / 100)
      const correctAnswers = Math.round((submission.successRate * totalProblems) / 100);

      return {
        studentName: submission.name,
        correctAnswers: correctAnswers,
        submissions: [],
      };
    });
  }, [reportData]);

  // 로딩 중이면 로딩 표시
  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-xl">저장된 리포트를 불러오는 중...</div>
      </div>
    );
  }

  // 저장된 리포트가 없으면 에러 표시
  if (!savedReport || !reportData) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-xl">저장된 리포트를 찾을 수 없습니다.</div>
      </div>
    );
  }

  // 수업 제목 결정 (저장된 리포트의 제목 사용)
  const roomTitle = savedReport.room_title;

  // 리포트 타입에 따라 다른 컴포넌트 렌더링
  if (savedReport.report_type === 'teacher') {
    // 선생님 리포트 - ReportLayout + OverallReportView/StudentReportView 사용
    const actionButtons = (
      <button
        onClick={() => navigate('/mypage')}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-md text-white font-medium hover:from-red-700 hover:to-red-800 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> MyPage로 돌아가기
      </button>
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

    return (
      <ReportLayout roomTitle={roomTitle} actions={actionButtons} tabs={tabs} userType="teacher">
        {activeView === 'overall' && (
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
  } else {
    // 학생 리포트 - StudentReportDashboardView 사용
    return (
      <StudentReportDashboardView
        roomTitle={roomTitle}
        studentMetrics={studentMetrics}
        categoryData={categoryData}
        problemAnalysisData={problemAnalysisData}
        reportData={reportData}
        currentStudentName={user?.name}
        roomId={reportId} // 저장된 리포트 ID를 roomId로 사용
        isSavedReport={true} // 저장된 리포트임을 표시
      />
    );
  }
};

export default SavedReportDetailPage;
