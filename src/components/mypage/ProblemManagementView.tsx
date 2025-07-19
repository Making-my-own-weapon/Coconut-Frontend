import React from 'react';
import MyPageComponentProblem from './MyPageComponentProblem';
import ProblemManagementComponent from './ProblemManagementComponent'; // 👈 1. 새 컴포넌트 import

// 👇 2. 데이터 구조를 ProblemManagementComponent에 맞게 수정
const mockProblems = [
  {
    problemId: 1,
    title: '슬라이딩 윈도우 중앙 값',
    description:
      '배열에서 슬라이딩 윈도우의 중앙값을 찾는 문제입니다. 효율적인 자료구조 사용이 중요합니다.',
    category: '자료구조',
    createdAt: '2025-07-10',
    testCaseCount: 15,
  },
  {
    problemId: 2,
    title: '이상한 알고리즘',
    description: '주어진 수에 대해 특정 연산을 반복하여 1로 만드는 과정을 시뮬레이션합니다.',
    category: '수학',
    createdAt: '2025-07-08',
    testCaseCount: 10,
  },
];

const ProblemManagementView: React.FC = () => {
  // 👇 삭제 버튼 클릭 시 실행될 임시 핸들러
  const handleDeleteProblem = (problemId: number) => {
    alert(`${problemId}번 문제를 삭제합니다.`);
  };

  return (
    <div className="flex-1 h-[900px] rounded-2xl border border-gray-200 bg-white shadow-md p-8 flex flex-col">
      {/* 제목 부분 */}
      <div className="flex-shrink-0">
        <h1 className="text-black font-bold text-[32px] leading-[48px] mb-1">문제 관리</h1>
        <span className="text-gray-500">내가 만든 알고리즘 문제들을 관리할 수 있습니다.</span>
      </div>

      {/* 컨트롤 바 컴포넌트 */}
      <div className="mt-8 mb-6 flex-shrink-0">
        <MyPageComponentProblem totalProblems={mockProblems.length} />
      </div>

      {/* 👇 3. 문제 목록 렌더링 부분을 수정 */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {mockProblems.map((problem) => (
            <ProblemManagementComponent
              key={problem.problemId}
              problem={problem}
              onDelete={handleDeleteProblem}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProblemManagementView;
