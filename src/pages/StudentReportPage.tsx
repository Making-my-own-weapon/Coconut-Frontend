import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { StudentReportDashboardView } from '../components/report';
import { getRoomDetailsAPI } from '../api/teacherApi';
import { useAuthStore } from '../store/authStore';
import { useReportStore } from '../store/reportStore';

interface RoomInfo {
  roomId: number;
  title: string;
  status: string;
}

// ReportData 인터페이스 제거 (reportStore의 타입 사용)

const StudentReportPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 현재 사용자 정보 가져오기
  const { user } = useAuthStore();

  // reportStore 사용
  const { reportData, fetchReport } = useReportStore();

  useEffect(() => {
    const fetchData = async () => {
      if (!roomId) return;

      try {
        setIsLoading(true);

        // reportStore의 fetchReport 사용
        await fetchReport(roomId);

        // 룸 정보만 별도로 가져오기
        const roomResponse = await getRoomDetailsAPI(roomId);
        setRoomInfo(roomResponse.data);
      } catch (error) {
        console.error('데이터를 가져오는데 실패했습니다:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [roomId, fetchReport, user]);

  // 수업 제목 결정
  const roomTitle = roomInfo?.title || reportData?.roomTitle || `Room ${roomId} - 학습 리포트`;

  // 학생 메트릭 데이터 생성
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

  // 전체 문제 목록 추출 (problems 필드 기반)
  const allProblems: any[] = (reportData as any)?.problems || [];

  // 카테고리별 문제 개수 집계 (모든 문제 기준)
  const categoryData = React.useMemo(() => {
    if (!allProblems || allProblems.length === 0) {
      console.log('allProblems is empty:', allProblems);
      return [];
    }
    const categoryMap: { [category: string]: Set<number> } = {};
    allProblems.forEach((problem: any) => {
      if (problem.categories && Array.isArray(problem.categories)) {
        problem.categories.forEach((cat: string) => {
          if (!categoryMap[cat]) categoryMap[cat] = new Set();
          categoryMap[cat].add(problem.problemId);
        });
      }
    });
    const result = Object.entries(categoryMap).map(([name, problemSet]) => ({
      name,
      count: problemSet.size,
      uniqueProblems: problemSet.size,
      problemTitles: Array.from(problemSet).map(
        (id) => allProblems.find((p) => p.problemId === id)?.title || '',
      ),
    }));
    console.log('categoryData:', result);
    return result;
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

  // 문제 분석 데이터 (학생별 정답률 데이터 활용) - 이전 코드 제거

  // 로딩 중이면 로딩 표시
  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-xl">수업 정보를 불러오는 중...</div>
      </div>
    );
  }

  return (
    <StudentReportDashboardView
      roomTitle={roomTitle}
      studentMetrics={studentMetrics}
      categoryData={categoryData}
      problemAnalysisData={problemAnalysisData}
      reportData={reportData}
      currentStudentName={user?.name}
      roomId={roomId}
    />
  );
};
export default StudentReportPage;
