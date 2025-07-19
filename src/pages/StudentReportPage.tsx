import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { StudentReportDashboardView } from '../components/report';
import { getRoomDetailsAPI } from '../api/teacherApi';
import { getReportAPI } from '../api/reportApi';

interface RoomInfo {
  roomId: number;
  title: string;
  status: string;
  // 필요한 다른 필드들...
}

interface ReportData {
  roomTitle: string;
  averageSuccessRate: number;
  totalSubmissions: number;
  totalProblems: number;
  totalStudents: number;
  firstSubmissionPassed: number; // 첫 제출에 통과한 문제 수
  problemAnalysis: Array<{
    title: string;
    successRate: number;
  }>;
  studentSubmissions: Array<{
    name: string;
    successRate: number;
  }>;
  categoryAnalysis: Array<{
    name: string;
    successRate: number;
    totalSubmissions: number;
    passedSubmissions: number;
    uniqueProblems: number;
    problemTitles: string[];
    participatingStudents: number;
    studentPerformance: Array<{
      studentId: number;
      studentName: string;
      submissions: number;
      passed: number;
      successRate: number;
    }>;
    firstSubmissionSuccessRate: number;
    averageAttemptsPerProblem: number;
  }>;
  bestCategory: {
    name: string;
    successRate: number;
  };
  worstCategory: {
    name: string;
    successRate: number;
  };
  // 필요한 다른 필드들...
}

const StudentReportPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!roomId) return;

      try {
        setIsLoading(true);

        // 병렬로 두 API 호출
        const [roomResponse, reportResponse] = await Promise.all([
          getRoomDetailsAPI(roomId),
          getReportAPI(roomId),
        ]);

        setRoomInfo(roomResponse.data);
        setReportData(reportResponse.data);
      } catch (error) {
        console.error('데이터를 가져오는데 실패했습니다:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [roomId]);

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
          value: `${reportData.firstSubmissionPassed} 개`,
        },
        {
          type: 'bestCategory' as const,
          title: '가장 많이 통과한 카테고리',
          value: reportData.bestCategory?.name || '데이터 없음',
        },
        {
          type: 'worstCategory' as const,
          title: '가장 어려웠던 카테고리',
          value: reportData.worstCategory?.name || '데이터 없음',
        },
      ]
    : undefined;

  // 카테고리 데이터
  const categoryData = reportData?.categoryAnalysis?.map((category) => ({
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
    />
  );
};
export default StudentReportPage;
