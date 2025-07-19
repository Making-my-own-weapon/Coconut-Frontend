import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface MyPageComponentProblemProps {
  totalProblems?: number;
  onSearch?: (query: string) => void;
  onCategoryChange?: (category: string) => void;
  onSortChange?: (sort: string) => void;
  categories?: string[];
  sortOptions?: string[];
  className?: string;
}

const MyPageComponentProblem: React.FC<MyPageComponentProblemProps> = ({
  totalProblems = 5,
  onSearch,
  onCategoryChange,
  onSortChange,
  categories = [
    '전체',
    '그래프',
    '동적 계획법',
    '그리디',
    '자료 구조',
    '수학',
    '문자열',
    '분할 정복',
    '백트래킹',
  ],
  sortOptions = ['최신순', '오래된순', '제목순'],
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('카테고리');
  const [selectedSort, setSelectedSort] = useState('최신순');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setShowCategoryDropdown(false);
    onCategoryChange?.(category);
  };

  const handleSortSelect = (sort: string) => {
    setSelectedSort(sort);
    setShowSortDropdown(false);
    onSortChange?.(sort);
  };

  return (
    <div className={`w-full ${className}`}>
      {/* 1. 검색창과 필터를 묶는 Flexbox 컨테이너 */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        {/* 검색창 */}
        <div className="w-full sm:w-auto sm:flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="문제 제목이나 설명으로 검색..."
            className="w-full h-[47px] px-4 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 드롭다운 그룹 */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowCategoryDropdown(!showCategoryDropdown);
              }}
              className="w-36 h-[40px] rounded-lg border border-gray-700 bg-white flex items-center justify-between px-4"
            >
              <span className="text-sm text-gray-700">{selectedCategory}</span>
              <ChevronDown className="w-5 h-5 text-gray-700" />
            </button>
            {showCategoryDropdown && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border rounded-lg shadow-lg z-10">
                {categories.map((category, index) => (
                  <button
                    key={index}
                    onClick={() => handleCategorySelect(category)}
                    className="w-36 px-4 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowSortDropdown(!showSortDropdown);
              }}
              className="w-32 h-[40px] rounded-lg border border-gray-700 bg-white flex items-center justify-between px-4"
            >
              <span className="text-sm text-gray-700">{selectedSort}</span>
              <ChevronDown className="w-5 h-5 text-gray-700" />
            </button>
            {showSortDropdown && (
              <div className="absolute top-full left-0 mt-1 w-full bg-white border rounded-lg shadow-lg z-10">
                {sortOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleSortSelect(option)}
                    className="w-32 px-4 py-2 text-left text-sm hover:bg-gray-50"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 문제 개수 표시 */}
      <div>
        <p className="text-sm text-gray-500">
          총 <span className="font-semibold text-black">{totalProblems}</span>개의 문제
        </p>
      </div>
    </div>
  );
};

export default MyPageComponentProblem;
