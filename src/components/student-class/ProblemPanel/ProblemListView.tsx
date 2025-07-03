import React from 'react';
import { type Problem } from '../../../store/teacherStore';

// 개별 문제 항목 컴포넌트
const ProblemListItem: React.FC<{
  problem: Problem;
  onSelect: (id: number) => void;
}> = ({ problem, onSelect }) => {
  // ... (ProblemListItem의 코드는 그대로 유지)
  return (
    <button
      onClick={() => onSelect(problem.problemId)}
      className="w-full p-3 rounded-md text-left transition-colors flex justify-between items-center bg-slate-700 hover:bg-slate-600"
    >
      <span className="font-medium text-sm text-white">{problem.title}</span>
    </button>
  );
};

// 메인 목록 뷰 컴포넌트
// 👇 onOpenCreateModal, onOpenImportModal props를 제거합니다.
export const ProblemListView: React.FC<{
  problems: Problem[];
  onSelectProblem: (id: number) => void;
}> = ({ problems, onSelectProblem }) => (
  <div className="p-4 h-full flex flex-col">
    <h2 className="text-xl font-semibold text-white mb-4 flex-shrink-0">문제 선택</h2>

    {/* 👇 문제 추가/가져오기 버튼 부분을 삭제합니다. */}

    <div className="flex-grow overflow-y-auto pr-2 space-y-2">
      {problems.map((problem) => (
        <ProblemListItem key={problem.problemId} problem={problem} onSelect={onSelectProblem} />
      ))}
    </div>
  </div>
);

export default ProblemListView;
