import React from 'react';

interface MyPageBoxClassProps {
  className?: string;
}

const MyPageBoxClass: React.FC<MyPageBoxClassProps> = ({ className = '' }) => {
  return (
    <div className={`relative w-full max-w-[745px] h-[391px] ${className}`}>
      <div className="w-full h-full rounded-lg border border-gray-300 bg-gray-50 relative">
        <div className="absolute left-[17px] top-[9px] w-[94px] h-12">
          <span className="text-black font-inter text-2xl font-bold leading-[48px]">수업 참여</span>
        </div>
      </div>
    </div>
  );
};

export default MyPageBoxClass;
