import React, { useState } from 'react';
import DonutChart from './DonutChart';

export interface CategoryData {
  name: string;
  count: number; // 정답률 (successRate)
  passedCount?: number; // 맞춘 개수
  totalCount?: number; // 총 제출 개수
  uniqueProblems?: number; // 고유 문제 수
  problemTitles?: string[]; // 포함된 문제들
  participatingStudents?: number; // 참여 학생 수
  firstSubmissionSuccessRate?: number; // 첫 제출 성공률
}

export interface ProblemAnalysisData {
  name: string;
  count: number;
}

export interface BoardReportBoxProps {
  categoryData?: CategoryData[];
  problemAnalysisData?: ProblemAnalysisData[];
  onCategoryClick?: () => void;
  onProblemClick?: () => void;
  className?: string;
}

const defaultCategoryData: CategoryData[] = [
  { name: '데이터 준비중', count: 0, passedCount: 0, totalCount: 0 },
];

const defaultProblemAnalysisData: ProblemAnalysisData[] = [{ name: '데이터 준비중', count: 0 }];

// 차트 색상 팔레트 (채도 더 낮춤)
const categoryColors = [
  '#4F46E5', // 어두운 인디고
  '#059669', // 어두운 에메랄드
  '#B45309', // 어두운 앰버
  '#B91C1C', // 어두운 로즈
  '#6D28D9', // 어두운 바이올렛
];

const problemColors = [
  '#047857', // 더 어두운 에메랄드 (맞은 문제)
  '#B91C1C', // 어두운 로즈 (틀린 문제)
  '#B45309', // 어두운 앰버 (출력 형식)
  '#991B1B', // 더 어두운 로즈 (틀렸습니다)
  '#C2410C', // 어두운 오렌지 (시간 초과)
];

const BoardReportBox: React.FC<BoardReportBoxProps> = ({
  categoryData,
  problemAnalysisData,

  onCategoryClick,
  onProblemClick,
  className = '',
}) => {
  const [activeChart, setActiveChart] = useState<'category' | 'problem'>('category');

  // 실제 데이터가 있으면 사용하고, 없으면 기본값 사용
  const actualCategoryData =
    categoryData && categoryData.length > 0 ? categoryData : defaultCategoryData;
  const actualProblemAnalysisData =
    problemAnalysisData && problemAnalysisData.length > 0
      ? problemAnalysisData
      : defaultProblemAnalysisData;

  const handleCategoryClick = () => {
    setActiveChart('category');
    onCategoryClick?.();
  };

  const handleProblemClick = () => {
    setActiveChart('problem');
    onProblemClick?.();
  };

  // 차트 데이터 변환
  const chartData =
    activeChart === 'category'
      ? actualCategoryData.map((item, index) => ({
          name: item.name,
          count: item.count,
          color: categoryColors[index % categoryColors.length],
        }))
      : actualProblemAnalysisData.map((item, index) => ({
          name: item.name,
          count: item.count,
          color: problemColors[index % problemColors.length],
        }));

  const chartTitle = activeChart === 'category' ? '카테고리별 성과' : '학생별 정답률';

  return (
    <div className={`w-full ${className}`}>
      {/* Mobile and tablet responsive grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:gap-6">
        {/* Left column - Category and Problem cards */}
        <div className="space-y-4 xl:space-y-6">
          {/* Category Performance Card */}
          <div
            className={`relative w-full h-[280px] cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
              activeChart === 'category' ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={handleCategoryClick}
          >
            <div className="w-full h-full bg-slate-800 border border-slate-600 rounded-2xl" />

            {/* Title */}
            <div
              className="absolute left-6 top-6 text-white text-2xl font-bold leading-9"
              style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              카테고리별 성과
            </div>

            {/* Category list */}
            <div className="absolute left-6 top-[74px] space-y-5">
              {actualCategoryData.map((category, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center w-[542px] max-w-[calc(100vw-120px)]"
                >
                  <span
                    className="text-white text-base font-normal leading-6"
                    style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif' }}
                  >
                    {category.name}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span
                      className="text-white text-base font-bold leading-6"
                      style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif' }}
                    >
                      {category.count}%
                    </span>
                    {category.passedCount !== undefined && category.totalCount !== undefined && (
                      <span
                        className="text-slate-300 text-sm font-medium"
                        style={{
                          fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                        }}
                      >
                        ({category.passedCount}/{category.totalCount})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Problem Analysis Card */}
          <div
            className={`relative w-full h-[280px] cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
              activeChart === 'problem' ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={handleProblemClick}
          >
            <div className="w-full h-full bg-slate-800 border border-slate-600 rounded-2xl" />

            {/* Title */}
            <div
              className="absolute left-6 top-6 text-white text-2xl font-bold leading-9"
              style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              학생별 정답률
            </div>

            {/* Problem analysis list */}
            <div className="absolute left-6 top-[74px] space-y-5">
              {actualProblemAnalysisData.map((problem, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center w-[542px] max-w-[calc(100vw-120px)]"
                >
                  <span
                    className="text-white text-base font-normal leading-6"
                    style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif' }}
                  >
                    {problem.name}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span
                      className="text-white text-base font-bold leading-6"
                      style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif' }}
                    >
                      {problem.count}
                    </span>
                    <span
                      className="text-white text-base font-bold leading-6"
                      style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif' }}
                    >
                      개
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Chart card */}
        <div className="relative w-full h-[595px]">
          <div className="w-full h-full bg-slate-800 border border-slate-600 rounded-2xl" />

          {/* Chart Container */}
          <div className="absolute inset-6">
            <DonutChart data={chartData} title={chartTitle} className="h-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardReportBox;
