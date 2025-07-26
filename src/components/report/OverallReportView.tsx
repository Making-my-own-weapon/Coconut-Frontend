import React from 'react';
import { CheckCircle, Clock, Frown, Smile, BarChart3, Save } from 'lucide-react';
import { MetricCard, InfoBox } from './';
import BarChart from './BarChart';

// 이 컴포넌트가 받을 데이터의 타입을 정의합니다.
interface OverallReportViewProps {
  reportData: any; // 나중에 구체적인 타입으로 변경
  problemChartOptions: any;
  problemChartData: any;
  studentChartOptions: any;
  studentChartData: any;
}

const OverallReportView: React.FC<OverallReportViewProps> = ({
  reportData,
  problemChartOptions,
  problemChartData,
  studentChartOptions,
  studentChartData,
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* 왼쪽 사이드바 */}
      <div className="w-full lg:w-1/3 flex-shrink-0 space-y-4">
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
            title="첫 제출에 통과한 문제"
            value={
              reportData?.averageSolveTime && !isNaN(Number(reportData.averageSolveTime))
                ? `${reportData.averageSolveTime}개`
                : '0개'
            }
            bgGradient="bg-gradient-to-r from-emerald-700 to-emerald-500"
            icon={<Clock className="w-10 h-10 text-emerald-400" />}
            shadowColor="shadow-[0px_8px_30px_0px_rgba(16,185,129,0.20)]"
            className="w-full h-24"
          />
          <MetricCard
            title="가장 어려운 문제"
            subtitle={reportData?.hardestProblem?.name || 'N/A'}
            value=""
            bgGradient="bg-gradient-to-r from-orange-600 to-amber-500"
            icon={<Frown className="w-10 h-10 text-amber-400" />}
            shadowColor="shadow-[0px_8px_30px_0px_rgba(245,158,11,0.20)]"
            className="w-full h-24"
          />
          <MetricCard
            title="가장 쉬운 문제"
            subtitle={reportData?.easiestProblem?.name || 'N/A'}
            value=""
            bgGradient="bg-gradient-to-r from-purple-700 to-purple-500"
            icon={<Smile className="w-10 h-10 text-purple-400" />}
            shadowColor="shadow-[0px_8px_30px_0px_rgba(139,92,246,0.20)]"
            className="w-full h-24"
          />
        </div>
        <InfoBox
          title="방 정보"
          icon={<BarChart3 className="w-6 h-6 text-blue-500" />}
          className="w-full h-24"
        >
          <div className="flex items-center justify-around w-full gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold">{reportData?.totalProblems || 0}</div>
              <div className="text-xs text-slate-400">총 문제</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{reportData?.totalStudents || 0}</div>
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
            <span className="text-2xl font-bold">{reportData?.classTime || '00:00:00'}</span>
          </div>
        </InfoBox>
        <InfoBox
          title="총 제출 횟수"
          icon={<Save className="w-6 h-6 text-green-500" />}
          className="w-full h-24"
        >
          <div className="text-center w-full">
            <span className="text-2xl font-bold">{reportData?.totalSubmissions || 0} 회</span>
          </div>
        </InfoBox>
      </div>

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
  );
};

export default OverallReportView;
