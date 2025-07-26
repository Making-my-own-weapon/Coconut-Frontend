import React from 'react';

interface MyPageComponentProblemProps {
  totalProblems?: number;
  className?: string;
}

const MyPageComponentProblem: React.FC<MyPageComponentProblemProps> = ({
  totalProblems = 0, // 기본값을 0으로 설정
  className = '',
}) => {
  return (
    <div className={`w-full ${className}`}>
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
