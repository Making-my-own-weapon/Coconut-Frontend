import React from 'react';

interface NavItem {
  label: string;
  key: string;
}

interface MyPageLeftSideProps {
  onItemClick?: (key: string) => void;
  activeItem?: string;
}

const MyPageLeftSide: React.FC<MyPageLeftSideProps> = ({ onItemClick, activeItem }) => {
  const navItems: NavItem[] = [
    { label: '계정 관리', key: 'account-management' },
    { label: '리포트', key: 'report' },
    { label: '문제 관리', key: 'problem-management' },
  ];

  const handleItemClick = (key: string) => {
    onItemClick?.(key);
  };

  return (
    <div className="w-full max-w-[303px] h-[900px] flex-shrink-0">
      {/* Main Container */}
      <div
        className="w-full h-full rounded-2xl border border-gray-200 bg-white flex-shrink-0"
        style={{
          boxShadow:
            '0px 4px 6px 0px rgba(0, 0, 0, 0.10), 0px 0px 0px 0px rgba(0, 0, 0, 0.00), 0px 0px 0px 0px rgba(0, 0, 0, 0.00), 0px 0px 0px 0px rgba(0, 0, 0, 0.00), 0px 0px 0px 0px rgba(0, 0, 0, 0.00)',
        }}
      >
        {/* Navigation Items */}
        <div className="flex flex-col gap-2">
          {navItems.map((item, index) => (
            <button
              key={item.key}
              onClick={() => handleItemClick(item.key)}
              className={`
                w-full text-left font-bold text-[30px] leading-[48px] font-inter text-black
                transition-colors duration-200 hover:text-gray-600 focus:text-gray-700
                ${index === 0 ? 'mt-[38px]' : index === 1 ? 'mt-[7px]' : 'mt-[7px]'}
                ${activeItem === item.key ? 'text-gray-800' : 'text-black'}
              `}
              style={{
                fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
              }}
            >
              <span className="pl-[44px] pr-4">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyPageLeftSide;
