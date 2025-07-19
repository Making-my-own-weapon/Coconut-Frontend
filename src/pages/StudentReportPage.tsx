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

  // 로딩 중이면 로딩 표시
  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 text-white flex items-center justify-center">
        <div className="text-xl">수업 정보를 불러오는 중...</div>
      </div>
    );
  }

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

  // 카테고리 데이터
  const categoryData = (reportData as any)?.categoryAnalysis?.map((category: any) => ({
    name: category.name,
    count: category.successRate, // 카테고리별 정답률
    passedCount: category.passedSubmissions, // 맞춘 개수
    totalCount: category.totalSubmissions, // 총 제출 개수
    uniqueProblems: category.uniqueProblems, // 고유 문제 수
    problemTitles: category.problemTitles, // 포함된 문제들
    participatingStudents: category.participatingStudents, // 참여 학생 수
    firstSubmissionSuccessRate: category.firstSubmissionSuccessRate, // 첫 제출 성공률
  }));

  // 문제 분석 데이터 (학생별 정답률 데이터 활용)
  const problemAnalysisData = reportData?.studentSubmissions?.slice(0, 5)?.map((student) => ({
    name: student.name,
    count: student.successRate, // 학생별 정답률
  }));

  return (
    <StudentReportDashboardView
      roomTitle={roomTitle}
      studentMetrics={studentMetrics}
      categoryData={categoryData}
      problemAnalysisData={problemAnalysisData}
      reportData={reportData}
      currentStudentName={user?.name}
    />
  );
};
export default StudentReportPage;
