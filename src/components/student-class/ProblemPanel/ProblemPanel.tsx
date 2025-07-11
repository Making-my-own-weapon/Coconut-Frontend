import React, { useState, useMemo } from 'react';
import ProblemListView from './ProblemListView';
import ProblemDetailView from './ProblemDetailView';
import { type Problem } from '../../../store/teacherStore';

// 1. 컴포넌트가 받을 props 타입을 수정합니다. (problems 추가)
interface ProblemPanelProps {
  problems: Problem[]; // 부모로부터 받을 실제 문제 목록
  userCode: string;
  onSubmit: () => void;
  selectedProblemId: number | null;
  onSelectProblem: (problemId: number | null) => void;
}

export const ProblemPanel: React.FC<ProblemPanelProps> = ({
  problems,
  userCode,
  onSubmit,
  selectedProblemId,
  onSelectProblem,
}) => {
  const selectedProblem = useMemo(
    () => problems.find((p) => p.problemId === selectedProblemId) || null,
    [selectedProblemId, problems],
  );

  return (
    <aside className="w-[360px] h-full bg-slate-800 border-r border-slate-700">
      {selectedProblem ? (
        <ProblemDetailView
          problem={selectedProblem}
          onBackToList={() => onSelectProblem(null)}
          onSubmit={onSubmit}
          userCode={userCode}
        />
      ) : (
        <ProblemListView
          problems={problems}
          selectedProblemId={selectedProblemId}
          onSelectProblem={onSelectProblem}
        />
      )}
    </aside>
  );
};

export default ProblemPanel;
