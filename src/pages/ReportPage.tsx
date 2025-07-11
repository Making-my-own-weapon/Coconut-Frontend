import React, { useEffect } from 'react';
import { LogOut, Save, CheckCircle, Clock, Frown, Smile, BarChart3, Hourglass } from 'lucide-react';
import {
  ReportHeader,
  MetricCard,
  // ProblemAnalysisPanel,
  // StudentPerformancePanel,
  InfoBox,
} from '../components/report';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeacherStore } from '../store/teacherStore';
import IconSave from '../assets/icons/IconSave';
import BarChart from '../components/report/BarChart';
import { useReportStore } from '../store/reportStore';

const ReportPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const { deleteRoom, isLoading } = useTeacherStore();
  const { reportData, fetchReport } = useReportStore(); // 리포트 스토어 사용 - 『안채호』

  const handleLeaveRoom = async () => {
    if (roomId && window.confirm('정말로 수업을 종료하고 방을 삭제하시겠습니까?')) {
      try {
        await deleteRoom(roomId);
        navigate('/join'); // 성공 시 JoinPage로 이동
      } catch {
        alert('방 삭제에 실패했습니다.');
      }
    }
  };
  // 1. 문제별 차트
  const problemChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: '문제별 정답률', color: 'white', font: { size: 20 } },
    },
    scales: {
      x: { ticks: { color: 'white' } },
      y: { ticks: { color: 'white' } },
    },
  };
  const problemChartData = {
    labels: ['문제 A', '문제 B', '문제 C', '문제 D', '문제 E', '문제 F'],
    datasets: [
      {
        label: '정답률 (%)',
        data: [50, 75, 25, 100, 80, 60],
        backgroundColor: 'rgba(224, 28, 52, 1.0)', // Red
      },
    ],
  };

  // 2. 학생별 차트 데이터/옵션 정의
  const studentChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const, // 가로 막대 차트
    plugins: {
      legend: { display: false },
      title: { display: true, text: '학생별 정답률', color: 'white', font: { size: 20 } },
    },
    scales: {
      x: { ticks: { color: 'white' } },
      y: { ticks: { color: 'white' } },
    },
  };
  const studentChartData = {
    labels: ['배재준', '김대원', '정소영', '주의재'],
    datasets: [
      {
        label: '정답률 (%)',
        data: [85, 95, 70, 100],
        backgroundColor: 'rgba(232, 232, 123, 1.0)', // Yellow
      },
    ],
  };

  useEffect(() => {
    if (roomId) {
      fetchReport(roomId);
    }
  }, [roomId, fetchReport]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-2xl mx-auto">
        {/* --- 헤더 --- */}
        <ReportHeader />

        {/* --- 제목 및 탭 --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center my-8">
          <div className="mt-8">
            <h1 className="text-4xl lg:text-5xl font-extrabold">리포트</h1>
            <p className="text-slate-400 mt-1">실시간 학습 현황 및 성과 분석</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <button className="px-4 py-2 bg-blue-600 rounded-lg text-sm font-semibold">
              전체 현황
            </button>
            <button className="px-4 py-2 bg-slate-600/50 hover:bg-slate-600 rounded-lg text-sm font-semibold">
              문제 분석
            </button>
            <button className="px-4 py-2 bg-slate-600/50 hover:bg-slate-600 rounded-lg text-sm font-semibold">
              학생 현황
            </button>
          </div>
        </div>

        {/* --- 1. 메인 컨텐츠 영역을 Flexbox로 설정합니다. --- */}
        <div className="flex flex-col lg:flex-row gap-6 item-start">
          {/* --- 2. 왼쪽 사이드바 (전체의 1/3 너비) --- */}
          <div className="w-full lg:w-1/3 flex-shrink-0 space-y-4">
            {/* MetricCard 2x2 그리드 */}
            <div className="grid grid-cols-2 gap-4">
              <MetricCard
                title="평균 정답률"
                value={reportData ? `${reportData.averageSuccessRate}%` : '...'}
                bgGradient="bg-gradient-to-r from-blue-700 to-blue-500"
                icon={<CheckCircle className="w-10 h-10 text-blue-400" />}
                shadowColor="shadow-[0px_8px_30px_0px_rgba(59,130,246,0.20)]"
                className="w-full h-24"
              />
              <MetricCard
                title="평균 풀이 시간"
                value="21:36"
                bgGradient="bg-gradient-to-r from-emerald-700 to-emerald-500"
                icon={<Hourglass className="w-10 h-10 text-emerald-400" />}
                shadowColor="shadow-[0px_8px_30px_0px_rgba(16,185,129,0.20)]"
                className="w-full h-24"
              />
              <MetricCard
                title="가장 어려운 문제"
                value=""
                subtitle="동적 계획법"
                bgGradient="bg-gradient-to-r from-orange-600 to-amber-500"
                icon={<Frown className="w-10 h-10 text-amber-400" />}
                shadowColor="shadow-[0px_8px_30px_0px_rgba(245,158,11,0.20)]"
                className="w-full h-24"
              />
              <MetricCard
                title="가장 쉬운 문제"
                value=""
                subtitle="이진 탐색"
                bgGradient="bg-gradient-to-r from-purple-700 to-purple-500"
                icon={<Smile className="w-10 h-10 text-purple-400" />}
                shadowColor="shadow-[0px_8px_30px_0px_rgba(139,92,246,0.20)]"
                className="w-full h-24"
              />
            </div>

            {/* InfoBox 세로 정렬 */}
            <InfoBox
              title="방 정보"
              icon={<BarChart3 className="w-6 h-6 text-blue-500" />}
              className="w-full"
            >
              <div className="flex items-center gap-8">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">17</div>
                  <div className="text-xs text-slate-400">총 문제</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold">4</div>
                  <div className="text-xs text-slate-400">학생 수</div>
                </div>
              </div>
            </InfoBox>
            <InfoBox
              title="수업 시간"
              icon={<Clock className="w-6 h-6 text-amber-500" />}
              className="w-full"
            >
              <div className="flex items-center justify-center gap-1">
                <span className="text-2xl font-bold">03:45:17</span>
              </div>
            </InfoBox>
            <InfoBox
              title="총 제출 횟수"
              icon={<IconSave className="w-6 h-6" />}
              className="w-full"
            >
              <span className="text-2xl font-bold">36 회</span>
            </InfoBox>
          </div>

          {/* --- 3. 가운데 컨텐츠 (전체의 1/3 너비) --- */}
          {/* <div className="w-full lg:w-1/3">
            <ProblemAnalysisPanel />
          </div> */}

          {/* --- 4. 오른쪽 컨텐츠 (전체의 1/3 너비) --- */}
          {/* <div className="w-full lg:w-1/3">
            <StudentPerformancePanel />
          </div> */}

          {/* 오른쪽 차트 영역 */}
          <div className="w-full lg:w-2/3 flex flex-col gap-4">
            <div className="bg-slate-800 p-4 rounded-lg h-80">
              <BarChart options={problemChartOptions} data={problemChartData} />
            </div>
            <div className="bg-slate-800 p-4 rounded-lg h-80">
              <BarChart options={studentChartOptions} data={studentChartData} />
            </div>
          </div>
        </div>

        {/* --- 하단 버튼 영역 --- */}
        <div className="flex flex-col sm:flex-row gap-2 justify-end mt-8">
          <button className="flex items-center justify-center gap-2 px-3 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-md text-white font-medium">
            <Save className="w-5 h-5" /> 리포트 저장
          </button>
          <button
            onClick={handleLeaveRoom}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-800 rounded-md text-white font-medium hover:from-red-700 hover:to-red-900 disabled:opacity-50"
          >
            <LogOut className="w-5 h-5" /> 방 나가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
