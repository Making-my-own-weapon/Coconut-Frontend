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
