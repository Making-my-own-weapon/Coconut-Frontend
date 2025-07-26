import React from 'react';
import ReportChart from './ReportChart';

const ReportsSection: React.FC = () => {
  return (
    <div className="w-full lg:w-[832px] h-auto relative">
      {/* Card Background */}
      <div className="w-full h-full flex-shrink-0 rounded-2xl border border-gray-200 bg-white shadow-lg relative min-h-[600px] lg:min-h-[963px]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-10 pt-6 sm:pt-8 pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-black font-inter leading-12">
            리포트
          </h1>
          <button className="text-base text-black hover:text-gray-600 transition-colors">
            완료
          </button>
        </div>

        {/* Class Creation Section */}
        <div className="px-6 sm:px-10 mb-8">
          <div className="w-full h-auto bg-gray-50 rounded-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-black mb-6 leading-12">수업 생성</h2>

            {/* Chart Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-5 gap-2 sm:gap-3 lg:gap-4">
              <ReportChart score="7.5" />
              <div className="w-full aspect-[108/140] bg-[#5C98D4] rounded-lg"></div>
              <div className="w-full aspect-[108/140] bg-[#5C98D4] rounded-lg"></div>
              <div className="w-full aspect-[108/140] bg-[#5C98D4] rounded-lg"></div>
              <div className="w-full aspect-[108/140] bg-[#5C98D4] rounded-lg"></div>
              <div className="w-full aspect-[108/140] bg-[#5C98D4] rounded-lg"></div>
              <div className="w-full aspect-[108/140] bg-[#5C98D4] rounded-lg"></div>
              <div className="w-full aspect-[108/140] bg-[#5C98D4] rounded-lg"></div>
              <div className="w-full aspect-[108/140] bg-[#5C98D4] rounded-lg"></div>
              <div className="w-full aspect-[108/140] bg-[#5C98D4] rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Class Participation Section */}
        <div className="px-6 sm:px-10 pb-6 sm:pb-8">
          <div className="w-full bg-gray-50 rounded-lg border border-gray-200 p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-black mb-6 leading-12">수업 참여</h2>

            {/* Placeholder for participation content */}
            <div className="h-32 sm:h-40 lg:h-[300px] flex items-center justify-center text-gray-500">
              <p className="text-center">수업 참여 데이터가 표시됩니다</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsSection;
