/*
 * ======================================================================
 * 문제 패널(ProblemPanel) 메인 컴포넌트
 * ----------------------------------------------------------------------
 * - 학생 페이지 사이드에 위치하며, 문제 목록과 상세 내용을 표시합니다.
 * - 문제 목록 (ProblemListView)과 문제 상세 (ProblemDetailView) 두 개의 자식 컴포넌트를 조건부로 렌더링합니다.
 * - Pyodide (클라이언트 사이드 Python 실행 환경) 인스턴스를 관리하고,
 *   실행에 필요한 상태(pyodide, isPyodideLoading)를 자식에게 전달합니다.
 * - 어떤 문제가 선택되었는지(selectedProblemId) 상태를 관리하여 뷰 전환을 처리합니다.
 *
 * 주요 상태(State):
 * - selectedProblemId: 현재 선택된 문제의 ID. null이면 목록 뷰, 값이 있으면 상세 뷰를 표시합니다.
 * - pyodide: Pyodide 라이브러리 인스턴스. Python 코드 실행을 담당합니다.
 * - isPyodideLoading: Pyodide 라이브러리 로딩 상태. 로딩 중 UI를 표시하는 데 사용됩니다.
 *
 * 주요 props:
 * - userCode: 상위 컴포넌트(아마도 코드 에디터)에서 관리하는 사용자의 코드 문자열.
 * - onSubmit: 사용자가 '제출하기' 버튼을 눌렀을 때 실행될 콜백 함수.
 *
 * 데이터 흐름:
 * 1. 컴포넌트 마운트 시 `useEffect`를 통해 Pyodide를 비동기적으로 로드하고 `pyodide` 상태를 업데이트합니다.
 * 2. `ProblemListView`에 문제 목록(`mockProblems`)과 선택 핸들러(`setSelectedProblemId`)를 전달합니다.
 * 3. 사용자가 `ProblemListView`에서 특정 문제를 클릭하면 `setSelectedProblemId`가 호출되어 `selectedProblemId` 상태가 변경됩니다.
 * 4. `selectedProblemId`가 변경되면, `useMemo`를 통해 `selectedProblem`과 `selectedTestCases`가 다시 계산됩니다.
 * 5. `selectedProblem`이 존재하면 `ProblemDetailView`가 렌더링되며, 필요한 모든 데이터와 핸들러를 props로 전달받습니다.
 * 6. 사용자가 `ProblemDetailView`에서 '목록으로' 버튼을 클릭하면 `setSelectedProblemId(null)`이 호출되어 다시 목록 뷰로 전환됩니다.
 * ======================================================================
 */
import React, { useState, useMemo, useEffect } from 'react';
import ProblemListView from './ProblemListView.tsx'; // 문제 목록 뷰
import ProblemDetailView from './ProblemDetailView.tsx'; // 문제 상세 뷰
import type { Pyodide } from '../../../types/pyodide';

// TODO: 실제 데이터 연동 시 아래 mock 데이터만 교체하면 됩니다.
interface IProblem {
  id: string;
  title: string;
  description: string;
  status: 'pass' | 'fail' | 'none';
}
interface ITestCase {
  id: number;
  input: string;
  expectedOutput: string;
}

const mockProblems: IProblem[] = [
  {
    id: '1',
    title: 'A+B 문제',
    description: '두 수를 입력받아 더하는 문제',
    status: 'none',
  },
  {
    id: '2',
    title: '최대공약수',
    description: '두 수의 최대공약수를 구하는 문제',
    status: 'none',
  },
];
const mockTestCases: Record<string, ITestCase[]> = {
  '1': [{ id: 1, input: '1 2', expectedOutput: '3' }],
  '2': [{ id: 1, input: '12 18', expectedOutput: '6' }],
};

// ProblemPanel이 받을 props 타입 정의
interface ProblemPanelProps {
  userCode: string; // 학생이 작성한 코드
  onSubmit: () => void; // 제출 버튼 클릭 시 실행 함수
}

/*
 * ======================================================================
 * ProblemPanel 컴포넌트
 * - 문제 목록/상세, pyodide 환경, 테스트케이스 등 상태 관리
 * - userCode, onSubmit 등 props로 받아 하위로 전달
 * ======================================================================
 */
export const ProblemPanel: React.FC<ProblemPanelProps> = ({ userCode, onSubmit }) => {
  // 현재 선택된 문제 id (null이면 목록 화면)
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  // pyodide 인스턴스 (파이썬 실행 환경)
  const [pyodide, setPyodide] = useState<Pyodide | null>(null);
  // pyodide 로딩 상태
  const [isPyodideLoading, setIsPyodideLoading] = useState(true);

  // pyodide 초기화 (최초 1회)
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

  // 현재 선택된 문제 객체
  const selectedProblem = useMemo(
    () => mockProblems.find((p) => p.id === selectedProblemId) || null,
    [selectedProblemId],
  );
  // 현재 선택된 문제의 테스트케이스 배열
  const selectedTestCases = useMemo(
    () => (selectedProblemId ? mockTestCases[selectedProblemId] : []) || [],
    [selectedProblemId],
  );

  return (
    <aside className="w-[360px] h-full bg-slate-800 border-r border-slate-700">
      {/* pyodide 로딩 중이면 로딩 메시지 */}
      {isPyodideLoading ? (
        <div className="flex items-center justify-center h-full text-slate-400">
          <span>테스트 환경 로딩 중...</span>
        </div>
      ) : selectedProblem ? (
        // 문제 상세 뷰
        <ProblemDetailView
          problem={selectedProblem}
          testCases={selectedTestCases}
          onBackToList={() => setSelectedProblemId(null)}
          onSubmit={onSubmit}
          userCode={userCode}
          pyodide={pyodide}
        />
      ) : (
        // 문제 목록 뷰
        <ProblemListView problems={mockProblems} onSelectProblem={setSelectedProblemId} />
      )}
    </aside>
  );
};
export default ProblemPanel;
