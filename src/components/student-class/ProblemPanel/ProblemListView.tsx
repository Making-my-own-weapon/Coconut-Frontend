import React from 'react';

// `ProblemPanel`에서 사용할 문제 객체의 기본 타입
interface Problem {
  problemId: number;
  title: string;
}

// `ProblemListView`가 받을 props 타입 정의
interface ProblemListViewProps {
  problems: Problem[];
  selectedProblemId: number | null;
  onSelectProblem: (problemId: number) => void;
}

// 메인 목록 뷰 컴포넌트
const ProblemListView: React.FC<ProblemListViewProps> = ({
  problems,
  selectedProblemId,
  onSelectProblem,
}) => (
  <div className="p-4 h-full flex flex-col">
    <h2 className="text-xl font-semibold text-white mb-4 flex-shrink-0">문제 선택</h2>

    <div className="flex-grow overflow-y-auto pr-2 space-y-2">
      {problems.map((problem) => (
        <ProblemListItem
          key={problem.problemId}
          problem={problem}
          isSelected={problem.problemId === selectedProblemId}
          onSelect={onSelectProblem}
        />
      ))}
    </div>
  </div>
);

// 목록의 각 아이템 컴포넌트
const ProblemListItem: React.FC<{
  problem: Problem;
  isSelected: boolean;
  onSelect: (id: number) => void;
}> = ({ problem, isSelected, onSelect }) => (
  <button
    onClick={() => onSelect(problem.problemId)}
    className={`w-full text-left p-3 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
      isSelected
        ? 'bg-blue-600 text-white shadow-lg'
        : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
    }`}
  >
    <span className="font-medium">{problem.title}</span>
  </button>
);

export default ProblemListView;
