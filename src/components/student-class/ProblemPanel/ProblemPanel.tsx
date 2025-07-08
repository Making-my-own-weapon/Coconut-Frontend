import React, { useState, useMemo } from 'react';
import ProblemListView from './ProblemListView';
import ProblemDetailView from './ProblemDetailView';
import type { Pyodide } from '../../../types/pyodide';
import { type Problem } from '../../../store/teacherStore';

// 1. 컴포넌트가 받을 props 타입을 수정합니다. (problems 추가)
interface ProblemPanelProps {
  problems: Problem[]; // 부모로부터 받을 실제 문제 목록
  userCode: string;
  onSubmit: () => void;
  selectedProblemId: number | null;
  onSelectProblem: (problemId: number | null) => void;
}

// 2. 파일 내부에 있던 IProblem, ITestCase, mockProblems, mockTestCases는 모두 삭제합니다.

export const ProblemPanel: React.FC<ProblemPanelProps> = ({
  problems,
  userCode,
  onSubmit,
  selectedProblemId,
  onSelectProblem,
}) => {
  const [pyodide, setPyodide] = useState<Pyodide | null>(null);
  const [isPyodideLoading, setIsPyodideLoading] = useState(false);

  // Pyodide 로딩을 지연 로딩으로 변경 - 문제 상세보기에 들어갔을 때만 로딩
  const initPyodide = async () => {
    if (pyodide || isPyodideLoading) return; // 이미 로딩 중이거나 완료된 경우 리턴
    setIsPyodideLoading(true);
    try {
      const pyodideInstance = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/',
      });
      setPyodide(pyodideInstance);
    } catch (error) {
      console.error('Pyodide 로드 실패:', error);
    } finally {
      setIsPyodideLoading(false);
    }
  };

  // 문제 선택 시 Pyodide 로딩 시작
  const handleSelectProblem = (problemId: number | null) => {
    onSelectProblem(problemId);
    if (problemId !== null) {
      initPyodide(); // 문제 상세보기 진입 시 Pyodide 로딩 시작
    }
  };

  // 3. 선택된 문제 객체를 mockProblems 대신 props로 받은 problems에서 찾습니다.
  const selectedProblem = useMemo(
    () => problems.find((p) => p.problemId === selectedProblemId) || null,
    [selectedProblemId, problems],
  );

  return (
    <aside className="w-[360px] h-full bg-slate-800 border-r border-slate-700">
      {selectedProblem ? (
        <ProblemDetailView
          problem={selectedProblem}
          onBackToList={() => handleSelectProblem(null)}
          onSubmit={onSubmit}
          userCode={userCode}
          pyodide={pyodide}
          isPyodideLoading={isPyodideLoading}
        />
      ) : (
        <ProblemListView
          problems={problems}
          selectedProblemId={selectedProblemId}
          onSelectProblem={handleSelectProblem}
        />
      )}
    </aside>
  );
};

export default ProblemPanel;
