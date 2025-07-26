import React from 'react';
import MyPageReportBox from './MyPageReportBox'; // 👈 1. 컴포넌트 import

const MyPageReportView: React.FC = () => {
  return (
    <div className="flex-1 h-[900px] rounded-2xl border border-gray-200 bg-white shadow-md p-8">
      {/* 👇 2. 컴포넌트를 여기에 렌더링합니다. */}
      <MyPageReportBox />
    </div>
  );
};

export default MyPageReportView;
