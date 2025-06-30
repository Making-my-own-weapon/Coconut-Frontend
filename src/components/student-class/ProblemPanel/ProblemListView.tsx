/*
 * ======================================================================
 * 문제 목록 뷰(ProblemListView) 컴포넌트
 * ----------------------------------------------------------------------
 * - `ProblemPanel`의 자식 컴포넌트로, 전체 문제 리스트를 표시하는 역할을 합니다.
 * - 각 문제의 제목과 현재 상태(통과, 실패, 미해결)를 시각적으로 보여줍니다.
 *
 * 주요 로직:
 * - `problems` 배열을 props로 받아 `map` 함수를 통해 각 문제를 `ProblemListItem` 컴포넌트로 렌더링합니다.
 * - 사용자가 특정 문제를 클릭하면, `onSelectProblem` 콜백 함수를 호출하여 선택된 문제의 `id`를 부모 컴포넌트(`ProblemPanel`)로 전달합니다.
 *
 * `ProblemListItem` 내부 로직:
 * - 문제의 `status` 값('pass', 'fail', 'none')에 따라 다른 배경색과 텍스트를 가진 뱃지를 표시하여 상태를 시각화합니다.
 *
 * 주요 props:
 * - problems: 표시할 문제 객체들의 배열. 각 객체는 id, title, status 등을 포함합니다.
 * - onSelectProblem: 문제 항목이 클릭되었을 때 실행될 콜백 함수. 인자로 문제의 `id`를 받습니다.
 * ======================================================================
 */
import React from 'react';
// TODO: 실제 데이터 연결 시 아래 타입/데이터 부분만 교체하면 됩니다.
type IProblem = {
  id: string;
  title: string;
  description: string;
  status: 'pass' | 'fail' | 'none';
};

/*
 * ======================================================================
 * 개별 문제 항목(ProblemListItem) 컴포넌트
 * - 문제 목록의 각 아이템을 나타냅니다.
 * - 문제의 제목과 상태(pass/fail/none)에 따른 뱃지를 표시합니다.
 * - 클릭 시 `onSelect` 함수를 호출하여 문제 선택 이벤트를 처리합니다.
 * ======================================================================
 */
const ProblemListItem: React.FC<{
  problem: IProblem;
  onSelect: (id: string) => void;
}> = ({ problem, onSelect }) => {
  // 상태별 뱃지 색상 클래스
  const statusClasses = {
    pass: 'bg-green-600 text-green-100',
    fail: 'bg-red-600 text-red-100',
    none: 'bg-slate-500 text-slate-100',
  };
  return (
    <button
      onClick={() => onSelect(problem.id)}
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

/*
 * ======================================================================
 * 문제 목록 뷰(ProblemListView) 메인
 * - `problems` 배열을 받아 `ProblemListItem`으로 렌더링합니다.
 * ======================================================================
 */
export const ProblemListView: React.FC<{
  problems: IProblem[];
  onSelectProblem: (id: string) => void;
}> = ({ problems, onSelectProblem }) => (
  <div className="p-4 h-full flex flex-col">
    <h2 className="text-xl font-semibold text-white mb-4 flex-shrink-0">
      문제 선택
    </h2>
    <div className="flex-grow overflow-y-auto pr-2 space-y-2">
      {problems.map((problem) => (
        <ProblemListItem
          key={problem.id}
          problem={problem}
          onSelect={onSelectProblem}
        />
      ))}
    </div>
  </div>
);

export default ProblemListView;
