import React, { useState } from 'react';
import DonutChart from './DonutChart';

export interface CategoryData {
  name: string;
  count: number;
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
  { name: '수학', count: 7 },
  { name: '알고리즘', count: 2 },
  { name: '문자열', count: 3 },
  { name: '다이나믹 프로그래밍', count: 6 },
  { name: '너비 우선 탐색', count: 1 },
];

const defaultProblemAnalysisData: ProblemAnalysisData[] = [
  { name: '맞은 문제', count: 7 },
  { name: '시도했지만 맞지 못한 문제', count: 2 },
  { name: '출력 형식', count: 3 },
  { name: '틀렸습니다', count: 6 },
  { name: '시간 초과', count: 1 },
];

// 차트 색상 팔레트
const categoryColors = [
  '#3B82F6', // 파랑
  '#10B981', // 초록
  '#F59E0B', // 노랑
  '#EF4444', // 빨강
  '#8B5CF6', // 보라
];

const problemColors = [
  '#22C55E', // 초록 (맞은 문제)
  '#EF4444', // 빨강 (틀린 문제)
  '#F59E0B', // 노랑 (출력 형식)
  '#DC2626', // 진한 빨강 (틀렸습니다)
  '#F97316', // 주황 (시간 초과)
];

const BoardReportBox: React.FC<BoardReportBoxProps> = ({
  categoryData = defaultCategoryData,
  problemAnalysisData = defaultProblemAnalysisData,
  onCategoryClick,
  onProblemClick,
  className = '',
}) => {
  const [activeChart, setActiveChart] = useState<'category' | 'problem'>('category');

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
      ? categoryData.map((item, index) => ({
          name: item.name,
          count: item.count,
          color: categoryColors[index % categoryColors.length],
        }))
      : problemAnalysisData.map((item, index) => ({
          name: item.name,
          count: item.count,
          color: problemColors[index % problemColors.length],
        }));

  const chartTitle = activeChart === 'category' ? '카테고리별 성과' : '문제 분석 결과';

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
              {categoryData.map((category, index) => (
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
                  <div className="flex items-center space-x-1">
                    <span
                      className="text-white text-base font-bold leading-6"
                      style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif' }}
                    >
                      {category.count}
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
              문제 분석
            </div>

            {/* Problem analysis list */}
            <div className="absolute left-6 top-[74px] space-y-5">
              {problemAnalysisData.map((problem, index) => (
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
