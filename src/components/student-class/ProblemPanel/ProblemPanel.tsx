import React, { useState, useMemo, useEffect } from 'react';
import ProblemListView from './ProblemListView';
import ProblemDetailView from './ProblemDetailView';
import type { Pyodide } from '../../../types/pyodide';
import { type Problem } from '../../../store/teacherStore';

// 1. 컴포넌트가 받을 props 타입을 수정합니다. (problems 추가)
interface ProblemPanelProps {
  problems: Problem[]; // 부모로부터 받을 실제 문제 목록
  userCode: string;
  onSubmit: () => void;
}

// 2. 파일 내부에 있던 IProblem, ITestCase, mockProblems, mockTestCases는 모두 삭제합니다.

export const ProblemPanel: React.FC<ProblemPanelProps> = ({ problems, userCode, onSubmit }) => {
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);
  const [pyodide, setPyodide] = useState<Pyodide | null>(null);
  const [isPyodideLoading, setIsPyodideLoading] = useState(true);

  useEffect(() => {
    const initPyodide = async () => {
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
    initPyodide();
  }, []);

  // 3. 선택된 문제 객체를 mockProblems 대신 props로 받은 problems에서 찾습니다.
  const selectedProblem = useMemo(
    () => problems.find((p) => p.problemId === selectedProblemId) || null,
    [selectedProblemId, problems],
  );

  return (
    <aside className="w-[360px] h-full bg-slate-800 border-r border-slate-700">
      {isPyodideLoading ? (
        <div className="flex items-center justify-center h-full text-slate-400">
          <span>테스트 환경 로딩 중...</span>
        </div>
      ) : selectedProblem ? (
        <ProblemDetailView
          problem={selectedProblem}
          onBackToList={() => setSelectedProblemId(null)}
          onSubmit={onSubmit}
          userCode={userCode}
          pyodide={pyodide}
        />
      ) : (
        // 4. 문제 목록 뷰에 mockProblems 대신 props로 받은 problems를 전달합니다.
        <ProblemListView problems={problems} onSelectProblem={setSelectedProblemId} />
      )}
    </aside>
  );
};

export default ProblemPanel;
