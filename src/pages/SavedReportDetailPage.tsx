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
  const studentMetrics = React.useMemo(() => {
    if (!reportData || !user?.name) return undefined;
    const allProblems = reportData.problems || [];
    const totalProblems = allProblems.length || reportData.totalProblems || 1;
    const allSubmissions = reportData.submissions || [];
    // 한 번이라도 맞힌 문제의 고유 개수 계산 (현재 사용자)
    const solvedSet = new Set();
    allSubmissions.forEach((sub: any) => {
      if (sub.user?.name === user.name && sub.is_passed) {
        solvedSet.add(sub.problem?.problemId);
      }
    });
    const correctAnswers = solvedSet.size;
    const accuracy = Math.round((correctAnswers / totalProblems) * 100);
    return [
      {
        type: 'accuracy' as const,
        title: '정답률',
        value: `${accuracy}%`,
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
    ];
  }, [reportData, user?.name]);

  // 전체 문제 목록 추출 (problems 필드 기반)
  const allProblems: any[] = (reportData as any)?.problems || [];

  // 카테고리별 문제 개수 집계 (모든 문제 기준)
  const categoryData = React.useMemo(() => {
    if (!allProblems || allProblems.length === 0) return [];
    const categoryMap: { [category: string]: Set<number> } = {};
    allProblems.forEach((problem: any) => {
      if (problem.categories && Array.isArray(problem.categories)) {
        problem.categories.forEach((cat: string) => {
          if (!categoryMap[cat]) categoryMap[cat] = new Set();
          categoryMap[cat].add(problem.problemId);
        });
      }
    });
    return Object.entries(categoryMap).map(([name, problemSet]) => ({
      name,
      count: problemSet.size,
      uniqueProblems: problemSet.size,
      problemTitles: Array.from(problemSet).map(
        (id) => allProblems.find((p) => p.problemId === id)?.title || '',
      ),
    }));
  }, [allProblems]);

  // 문제 분석 데이터 (미제출 포함, 모든 문제 기준)
  const problemAnalysisData = React.useMemo(() => {
    if (!reportData || !user?.name) return undefined;
    const allSubmissions = (reportData as any).submissions || [];
    const userSubmissions = allSubmissions.filter(
      (submission: any) => submission.user?.name === user.name,
    );
    const submittedProblemIds = new Set(userSubmissions.map((sub: any) => sub.problem?.problemId));
    const unsubmittedProblems = allProblems.filter(
      (problem: any) => !submittedProblemIds.has(problem.problemId),
    );

    // 기존 분석 로직
    const passedCount = userSubmissions.filter((sub: any) => sub.is_passed).length;
    const failedSubmissions = userSubmissions.filter((sub: any) => !sub.is_passed);
    const stdoutGroups: { [key: string]: number } = {};
    failedSubmissions.forEach((submission: any) => {
      let stdout = submission.stdout || '알 수 없는 오류';
      const firstLine = stdout.split('\n')[0].trim();
      if (firstLine.length > 0) stdout = firstLine;
      if (stdout.length > 50) stdout = stdout.substring(0, 50) + '...';
      if (!stdout || stdout.trim() === '') stdout = '실행 오류';
      stdoutGroups[stdout] = (stdoutGroups[stdout] || 0) + 1;
    });
    const result = [];
    if (passedCount > 0) {
      result.push({ name: '통과', count: passedCount });
    }
    const failedReasons = Object.entries(stdoutGroups)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5)
      .map(([reason, count]) => ({ name: reason, count }));
    result.push(...failedReasons);
    // 미제출 문제 추가
    if (unsubmittedProblems.length > 0) {
      result.push({ name: '미제출', count: unsubmittedProblems.length });
    }
    return result.length > 0 ? result : undefined;
  }, [reportData, user?.name, allProblems]);

  // 학생 리포트 - categoryData, problemAnalysisData를 submissions 기반으로 재구성
  const allProblemsMap = React.useMemo(() => {
    if (!reportData || !(reportData as any).submissions) return new Map();
    const map = new Map();
    (reportData as any).submissions.forEach((sub: any) => {
      if (sub.problem) {
        map.set(sub.problem.problemId, sub.problem);
      }
    });
    return map;
  }, [reportData]);

  // 선생님 리포트용 차트 데이터 생성
  const problemChartOptions = React.useMemo(
    () => ({
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
      // 바 두께 옵션 추가
      datasets: {
        bar: {
          barThickness: 80,
          maxBarThickness: 84,
        },
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
      // 바 두께 옵션 추가
      datasets: {
        bar: {
          barThickness: 18,
          maxBarThickness: 22,
        },
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

    const allProblems = reportData.problems || [];
    const totalProblems = allProblems.length || reportData.totalProblems || 1;
    const allSubmissions = reportData.submissions || [];

    // 학생별로 한 번이라도 맞힌 문제의 고유 개수 계산
    const studentMap = new Map();
    allSubmissions.forEach((sub: any) => {
      if (!sub.user?.name || !sub.is_passed) return;
      if (!studentMap.has(sub.user.name)) studentMap.set(sub.user.name, new Set());
      studentMap.get(sub.user.name).add(sub.problem?.problemId);
    });

    // 전체 학생 목록 추출 (studentSubmissions 기준)
    const studentNames = (reportData.studentSubmissions || []).map((s: any) => s.name);

    return studentNames.map((studentName: string) => {
      const solvedSet = studentMap.get(studentName) || new Set();
      const correctAnswers = solvedSet.size;
      const accuracy = Math.round((correctAnswers / totalProblems) * 100);
      return {
        studentName,
        correctAnswers,
        accuracy,
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
