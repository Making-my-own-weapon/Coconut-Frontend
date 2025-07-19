import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import CreatedClassesView from './CreatedClassesView'; // 👈 뷰 import
import JoinedClassesView from './JoinedClassesView'; // 👈 뷰 import

const mockCreatedClasses = [
  {
    title: '자료구조 스터디',
    date: '2025-07-15',
    participantCount: 12,
    successRate: 45,
    categories: ['그리디', 'BF'],
  },
];
const mockJoinedClasses = [
  {
    title: '알고리즘 특강',
    date: '2025-07-12',
    participantCount: 8,
    successRate: 68,
    categories: ['DP', '백트래킹'],
  },
];

interface MyPageReportBoxProps {
  className?: string;
  onTabChange?: (tab: 'create' | 'join') => void;
  onSortChange?: (sort: string) => void;
}

const MyPageReportBox: React.FC<MyPageReportBoxProps> = ({
  className = '',
  onTabChange,
  onSortChange,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('최신순');

  const handleTabClick = (tab: 'create' | 'join') => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const handleSortSelect = (sort: string) => {
    setSelectedSort(sort);
    setIsDropdownOpen(false);
    onSortChange?.(sort);
  };

  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      {/* 제목 */}
      <div className="flex-shrink-0">
        <h1 className="text-black font-bold text-[32px] leading-[48px] mb-1">리포트</h1>
        <span className="text-gray-500">내 리포트를 볼 수 있습니다.</span>
      </div>

      {/* 탭과 정렬 드롭다운을 묶는 컨트롤 바 */}
      <div className="flex justify-between items-center my-6 flex-shrink-0">
        <div className="flex gap-2">
          <button
            onClick={() => handleTabClick('create')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              activeTab === 'create'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            수업 생성
          </button>
          <button
            onClick={() => handleTabClick('join')}
            className={`px-4 py-2 rounded-lg text-sm transition-colors ${
              activeTab === 'join'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            수업 참여
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-32 h-10 rounded-lg border border-gray-700 bg-white flex items-center justify-between px-3"
          >
            <span className="text-sm text-gray-600">{selectedSort}</span>
            <ChevronDown
              className={`w-5 h-5 text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 w-32 bg-white border rounded-lg shadow-lg z-10">
              <button
                onClick={() => handleSortSelect('최신순')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                최신순
              </button>
              <button
                onClick={() => handleSortSelect('오래된순')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                오래된순
              </button>
              <button
                onClick={() => handleSortSelect('이름순')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                이름순
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'create' && <CreatedClassesView classes={mockCreatedClasses} />}
        {activeTab === 'join' && <JoinedClassesView classes={mockJoinedClasses} />}
      </div>
    </div>
  );
};

export default MyPageReportBox;
