/*
 * ======================================================================
 * 문제 상세 뷰(ProblemDetailView) 컴포넌트
 * ----------------------------------------------------------------------
 * - `ProblemPanel`의 자식 컴포넌트로, 선택된 문제의 상세 정보를 표시합니다.
 * - '문제' 탭과 '테스트' 탭을 가지며, 사용자는 탭을 전환하며 문제 설명과 테스트케이스를 확인할 수 있습니다.
 * - Python 코드 실행(채점) 기능을 제공하며, 실행 결과를 사용자에게 보여줍니다.
 *
 * 주요 로직 및 하위 컴포넌트:
 * - Tabs: '문제'와 '테스트' 탭 UI 및 상태 전환 로직을 관리합니다.
 * - ProblemDescription: '문제' 탭 선택 시 보이며, 문제의 제목과 설명을 렌더링합니다.
 * - TestCaseViewer: '테스트' 탭 선택 시 보이며, `TestCaseItem`들을 리스트 형태로 보여줍니다.
 * - TestCaseItem:
 *   - 개별 테스트케이스를 나타내는 가장 핵심적인 컴포넌트입니다.
 *   - '실행' 버튼 클릭 시 `handleRunTest` 함수를 호출하여 props로 받은 `pyodide` 인스턴스를 사용해 `userCode`를 실행합니다.
 *   - 코드 실행 전, `pyodide.globals.set`을 이용해 테스트케이스의 입력을 파이썬 환경의 변수로 설정하고,
 *     `sys.stdin`을 리다이렉트하여 `input()` 함수가 해당 변수를 읽도록 설정합니다.
 *   - `pyodide.setStdout`을 통해 표준 출력을 캡처하여 `output` 상태에 저장합니다.
 *   - 실행 결과(`output`)와 기대 결과(`expectedOutput`)를 비교하여 정답/오답 여부를 UI에 표시합니다.
 *
 * 주요 상태(State):
 * - activeTab: 현재 활성화된 탭('problem' 또는 'test')을 저장합니다.
 * - (TestCaseItem 내부) isRunning: 테스트 실행 중인지 여부를 나타내어 버튼을 비활성화하는 데 사용됩니다.
 * - (TestCaseItem 내부) output: 코드 실행 후의 표준 출력 결과.
 * - (TestCaseItem 내부) error: 코드 실행 중 발생한 에러 메시지.
 *
 * 주요 props:
 * - problem: 표시할 문제의 상세 정보 (id, title, description).
 * - testCases: 해당 문제에 대한 테스트케이스 배열.
 * - onBackToList: '목록으로' 버튼 클릭 시 실행될 콜백 함수. 부모의 `selectedProblemId`를 `null`로 설정합니다.
 * - onSubmit: '제출하기' 버튼 클릭 시 실행될 콜백 함수.
 * - userCode: 사용자가 에디터에 작성한 코드. `TestCaseItem`에서 실행됩니다.
 * - pyodide: 코드 실행을 위한 Pyodide 인스턴스.
 * ======================================================================
 */
import React, { useState } from 'react';
import backIcon from '../../../assets/back.svg';
import playIcon from '../../../assets/play.svg';
import type { Pyodide } from '../../../types/pyodide';

// ===================== 타입 정의 =====================
// TODO: 실제 데이터 연동 시 아래 타입만 교체하면 됩니다.
type IProblemDetail = { id: string; title: string; description: string };
type ITestCase = { id: number; input: string; expectedOutput: string };

// ===================== props 타입 =====================
interface ProblemDetailViewProps {
  problem: IProblemDetail; // 문제 정보
  testCases: ITestCase[]; // 테스트케이스 배열
  onBackToList: () => void; // 문제 목록으로 돌아가기
  onSubmit: () => void; // 제출 버튼 클릭 시 실행 함수
  userCode: string; // 학생이 작성한 코드
  pyodide: Pyodide | null; // pyodide 인스턴스 (파이썬 실행 환경)
}

/*
 * ======================================================================
 * Tabs: 문제/테스트 탭 전환 컴포넌트
 * ======================================================================
 */
const Tabs: React.FC<{
  activeTab: string;
  setActiveTab: (tab: 'problem' | 'test') => void;
}> = ({ activeTab, setActiveTab }) => {
  const getTabClass = (tabName: 'problem' | 'test') =>
    `w-1/2 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-colors ${activeTab === tabName ? 'bg-slate-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`;
  return (
    <div className="flex w-full bg-slate-800 p-1 rounded-lg">
      <button onClick={() => setActiveTab('problem')} className={getTabClass('problem')}>
        문제
      </button>
      <button onClick={() => setActiveTab('test')} className={getTabClass('test')}>
        테스트
      </button>
    </div>
  );
};

/*
 * ======================================================================
 * ProblemDescription: 문제 설명 컴포넌트
 * ======================================================================
 */
const ProblemDescription: React.FC<{ problem: IProblemDetail }> = ({ problem }) => (
  <div className="text-slate-300 space-y-6">
    <h2 className="text-2xl font-bold text-white">{problem.title}</h2>
    <p className="text-sm">{problem.description}</p>
  </div>
);

/*
 * ======================================================================
 * TestCaseItem: 개별 테스트케이스 실행/채점 컴포넌트
 * - pyodide로 코드 실행, 결과/에러/정답여부 표시
 * ======================================================================
 */
const TestCaseItem: React.FC<{
  testCase: ITestCase;
  userCode: string;
  pyodide: Pyodide | null;
}> = ({ testCase, userCode, pyodide }) => {
  // 실행 상태 및 결과 관리
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  // ===================== 채점(실행) 로직 =====================
  const handleRunTest = async () => {
    if (!pyodide || !userCode) return;
    setIsRunning(true);
    setOutput('');
    setError('');
    try {
      // 입력값 세팅 및 표준입력 리다이렉트
      pyodide.globals.set('test_input', testCase.input);
      pyodide.runPython(`import sys; from io import StringIO; sys.stdin = StringIO(test_input)`);
      let capturedOutput = '';
      // 표준출력 캡처
      pyodide.setStdout({
        batched: (out: string) => {
          capturedOutput += out + '\n';
        },
      });
      // 코드 실행
      await pyodide.runPythonAsync(userCode);
      setOutput(capturedOutput.trim());
    } catch (e: any) {
      setError(e.message);
    } finally {
      pyodide.setStdout({});
      setIsRunning(false);
    }
  };
  // ===================== 정답/오답 판정 =====================
  const isCorrect = output && output.trim() === testCase.expectedOutput.trim();

  return (
    <div className="bg-slate-700 p-3 rounded-md">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-white text-sm">Test Case {testCase.id}</h4>
        <button onClick={handleRunTest} disabled={isRunning} className="disabled:opacity-50">
          {isRunning ? (
            <img src={playIcon} alt="실행 중" className="w-5 h-5 animate-spin" />
          ) : (
            <img src={playIcon} alt="실행" className="w-5 h-5 text-slate-400 hover:text-white" />
          )}
        </button>
      </div>
      <div className="text-xs font-mono text-slate-400 space-y-1">
        <p>
          <strong>입력:</strong> {testCase.input}
        </p>
        <p>
          <strong>기대 출력:</strong> {testCase.expectedOutput}
        </p>
        {output && (
          <p>
            <strong>실제 출력:</strong> {output}
            <span className={isCorrect ? 'text-green-400 ml-2' : 'text-red-400 ml-2'}>
              {isCorrect ? '정답' : '오답'}
            </span>
          </p>
        )}
        {error && (
          <p className="text-red-400">
            <strong>에러:</strong> {error}
          </p>
        )}
      </div>
    </div>
  );
};

/*
 * ======================================================================
 * TestCaseViewer: 테스트케이스 목록 컴포넌트
 * ======================================================================
 */
const TestCaseViewer: React.FC<{
  testCases: ITestCase[];
  userCode: string;
  pyodide: Pyodide | null;
}> = ({ testCases, userCode, pyodide }) => (
  <div className="space-y-4">
    {testCases.map((tc) => (
      <TestCaseItem key={tc.id} testCase={tc} userCode={userCode} pyodide={pyodide} />
    ))}
  </div>
);

/*
 * ======================================================================
 * ProblemDetailView: 메인 컴포넌트 (props로 모든 데이터/핸들러 받음)
 * ======================================================================
 */
export const ProblemDetailView: React.FC<ProblemDetailViewProps> = ({
  problem,
  testCases,
  onBackToList,
  onSubmit,
  userCode,
  pyodide,
}) => {
  const [activeTab, setActiveTab] = useState<'problem' | 'test'>('problem');

  return (
    <div className="h-full flex flex-col p-4 bg-slate-800">
      {/* 헤더: 뒤로가기 버튼과 제목 */}
      <header className="flex items-center mb-4">
        <button onClick={onBackToList} className="p-1 rounded-full hover:bg-slate-700 mr-3">
          <img src={backIcon} alt="뒤로가기" className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold truncate">{problem.title}</h1>
      </header>

      {/* 탭 */}
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* 탭 컨텐츠 */}
      <main className="flex-grow my-4 overflow-y-auto pr-2">
        {activeTab === 'problem' ? (
          <ProblemDescription problem={problem} />
        ) : (
          <TestCaseViewer testCases={testCases} userCode={userCode} pyodide={pyodide} />
        )}
      </main>

      {/* 푸터: 제출 버튼 */}
      <footer className="mt-auto pt-4 border-t border-slate-700">
        <button
          onClick={onSubmit}
          className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          채점 및 분석
        </button>
      </footer>
    </div>
  );
};

export default ProblemDetailView;
