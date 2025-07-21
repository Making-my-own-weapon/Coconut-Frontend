import React from 'react';
import SavedReportsView from './SavedReportsView'; // 👈 필요한 뷰만 import

// 👇 Props 인터페이스를 단순화합니다.
interface MyPageReportBoxProps {
  className?: string;
}

const MyPageReportBox: React.FC<MyPageReportBoxProps> = ({ className = '' }) => {
  // 👇 탭, 드롭다운 관련 useState와 핸들러를 모두 삭제합니다.

  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      {/* 제목 */}
      <div className="flex-shrink-0">
        <h1 className="text-black font-bold text-[32px] leading-[48px] mb-1">리포트</h1>
        <span className="text-gray-500">저장된 수업 리포트를 확인할 수 있습니다.</span>
      </div>

      {/* 👇 탭과 정렬 드롭다운을 묶던 컨트롤 바 div 전체를 삭제합니다. */}

      {/* 컨텐츠 영역 */}
      <div className="flex-1 overflow-y-auto mt-6">
        {' '}
        {/* mt-6 추가로 여백 확보 */}
        {/* 👇 조건부 렌더링을 삭제하고 SavedReportsView만 남깁니다. */}
        <SavedReportsView />
      </div>
    </div>
  );
};

export default MyPageReportBox;
