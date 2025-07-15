import React from 'react';
import type { Problem } from '../../../store/teacherStore';

// 1. ProblemListItem도 스토어의 Problem 타입을 사용하도록 수정합니다.
//    id의 타입도 number로 통일됩니다.
const ProblemListItem: React.FC<{
  problem: Problem;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  isCollaborating: boolean;
}> = ({ problem, onSelect, onDelete, isCollaborating }) => {
  const statusClasses = {
    pass: 'bg-green-600 text-green-100',
    fail: 'bg-red-600 text-red-100',
    none: 'bg-slate-500 text-slate-100',
  };
  return (
    <div className="w-full p-3 rounded-md text-left transition-colors flex justify-between items-center bg-slate-700 hover:bg-slate-600">
      <button
        // 2. onSelect에 problemId(number)를 전달합니다.
        onClick={() => onSelect(problem.problemId)}
        disabled={isCollaborating}
        className="flex-1 text-left"
      >
        <span className="font-medium text-sm text-white">{problem.title}</span>
      </button>
      <div className="flex items-center gap-2">
        <span
          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusClasses[problem.status]}`}
        >
          {problem.status}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(problem.problemId);
          }}
          disabled={isCollaborating}
          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded"
          title="방에서 문제 제거"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

// 3. 파일 내부에 별도로 정의했던 IProblem 타입은 이제 필요 없으므로 삭제합니다.

export const TeacherProblemListView: React.FC<{
  problems: Problem[];
  onSelectProblem: (id: number) => void;
  onDeleteProblem: (id: number) => void;
  onOpenCreateModal: () => void;
  onOpenImportModal: () => void;
  isCollaborating: boolean;
}> = ({
  problems,
  onSelectProblem,
  onDeleteProblem,
  onOpenCreateModal,
  onOpenImportModal,
  isCollaborating,
}) => {
  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-xl font-semibold text-white">문제 선택</h2>
        <div className="flex gap-2">
          <button
            onClick={onOpenCreateModal}
            disabled={isCollaborating}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
          >
            문제 추가
          </button>
          <button
            onClick={onOpenImportModal}
            disabled={isCollaborating}
            className="px-3 py-1 bg-slate-600 text-white rounded hover:bg-slate-700 text-sm font-medium"
          >
            문제 가져오기
          </button>
        </div>
      </div>
      <div className="flex-grow overflow-y-auto pr-2 space-y-2">
        {problems.map((problem) => (
          // 4. key도 problemId로 변경하고, onSelect에 onSelectProblem을 그대로 전달합니다.
          <ProblemListItem
            key={problem.problemId}
            problem={problem}
            onSelect={isCollaborating ? () => {} : onSelectProblem}
            onDelete={isCollaborating ? () => {} : onDeleteProblem}
            isCollaborating={isCollaborating}
          />
        ))}
      </div>
    </div>
  );
};

export default TeacherProblemListView;
