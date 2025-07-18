import React from 'react';

const MyPageRightPanel: React.FC = () => {
  return (
    <div className="flex-1 h-[900px] rounded-2xl border border-gray-200 bg-white shadow-md px-8 py-6">
      <h1 className="text-black font-semibold text-[25px] mb-4">선생님 리포트</h1>

      {/* 수업 생성 패널 */}
      <div className="h-[360px] border rounded-lg bg-gray-50"></div>

      {/* 수업 참여 패널 */}
      <h2 className="font-semibold text-[25px] text-gray-800 py-4">학생 리포트</h2>
      <div className="p-6 h-[360px] border rounded-lg bg-gray-50"></div>
    </div>
  );
};

export default MyPageRightPanel;
