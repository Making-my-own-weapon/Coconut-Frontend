import React from 'react';
import type { Problem } from '../../../store/teacherStore';

// 1. ProblemListItem도 스토어의 Problem 타입을 사용하도록 수정합니다.
//    id의 타입도 number로 통일됩니다.
const ProblemListItem: React.FC<{
  problem: Problem;
  onSelect: (id: number) => void;
}> = ({ problem, onSelect }) => {
  const statusClasses = {
    pass: 'bg-green-600 text-green-100',
    fail: 'bg-red-600 text-red-100',
    none: 'bg-slate-500 text-slate-100',
  };
  return (
    <button
      // 2. onSelect에 problemId(number)를 전달합니다.
      onClick={() => onSelect(problem.problemId)}
      className="w-full p-3 rounded-md text-left transition-colors flex justify-between items-center bg-slate-700 hover:bg-slate-600"
    >
      <span className="font-medium text-sm text-white">{problem.title}</span>
      <span
        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusClasses[problem.status]}`}
      >
        {problem.status}
      </span>
    </button>
  );
};

// 3. 파일 내부에 별도로 정의했던 IProblem 타입은 이제 필요 없으므로 삭제합니다.

export const TeacherProblemListView: React.FC<{
  problems: Problem[];
  onSelectProblem: (id: number) => void;
  onOpenCreateModal: () => void;
  onOpenImportModal: () => void;
}> = ({ problems, onSelectProblem, onOpenCreateModal, onOpenImportModal }) => {
  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-xl font-semibold text-white">문제 선택</h2>
        <div className="flex gap-2">
          <button
            onClick={onOpenCreateModal}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
          >
            문제 추가
          </button>
          <button
            onClick={onOpenImportModal}
            className="px-3 py-1 bg-slate-600 text-white rounded hover:bg-slate-700 text-sm font-medium"
          >
            문제 가져오기
          </button>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto pr-2 space-y-2">
        {problems.map((problem) => (
          // 4. key도 problemId로 변경하고, onSelect에 onSelectProblem을 그대로 전달합니다.
          <ProblemListItem key={problem.problemId} problem={problem} onSelect={onSelectProblem} />
        ))}
      </div>
    </div>
  );
};

export default TeacherProblemListView;
