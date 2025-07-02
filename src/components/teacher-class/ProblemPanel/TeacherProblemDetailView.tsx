/*
 * ======================================================================
 * 문제 상세 뷰(ProblemDetailView) 컴포넌트
 * ----------------------------------------------------------------------
 * - `ProblemPanel`의 자식 컴포넌트로, 선택된 문제의 상세 정보를 표시합니다.
 * - '문제' 탭과 '테스트' 탭을 가지며, 사용자는 탭을 전환하며 문제 설명과 테스트케이스를 확인할 수 있습니다.
 * - Python 코드 실행(채점) 기능을 제공하며, 실행 결과를 사용자에게 보여줍니다.
 *
 * 주요 로직 및 하위 컴포넌트:
 * - Tabs: '문제'/'테스트' 탭 UI 및 상태 전환
 * - ProblemDescription: 문제 설명 표시
 * - TestCaseViewer/TestCaseItem: 테스트케이스 목록 및 개별 실행/결과 표시
 *
 * 주요 props:
 * - problem: 표시할 문제의 상세 정보 (id, title, description)
 * - testCases: 해당 문제에 대한 테스트케이스 배열
 * - onBackToList: '목록으로' 버튼 클릭 시 실행될 콜백 함수
 * - onSubmit: '채점 및 분석' 버튼 클릭 시 실행될 콜백 함수
 * - userCode: 사용자가 에디터에 작성한 코드
 * - pyodide: 코드 실행을 위한 Pyodide 인스턴스
 * ======================================================================
 */
import React, { useState } from 'react';
import backIcon from '../../../assets/back.svg';
import playIcon from '../../../assets/play.svg';
import type { Pyodide } from '../../../types/pyodide';

type IProblemDetail = { id: string; title: string; description: string };
type ITestCase = { id: number; input: string; expectedOutput: string };

interface TeacherProblemDetailViewProps {
  problem: IProblemDetail;
  testCases: ITestCase[];
  onBackToList: () => void;
  onSubmit: () => void;
  userCode: string;
  pyodide: Pyodide | null;
}

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

const ProblemDescription: React.FC<{ problem: IProblemDetail }> = ({ problem }) => (
  <div className="text-slate-300 space-y-6">
    <h2 className="text-2xl font-bold text-white">{problem.title}</h2>
    <p className="text-sm">{problem.description}</p>
  </div>
);

const TestCaseItem: React.FC<{
  testCase: ITestCase;
  userCode: string;
  pyodide: Pyodide | null;
}> = ({ testCase, userCode, pyodide }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const handleRunTest = async () => {
    if (!pyodide || !userCode) return;
    setIsRunning(true);
    setOutput('');
    setError('');
    try {
      pyodide.globals.set('test_input', testCase.input);
      pyodide.runPython(`import sys; from io import StringIO; sys.stdin = StringIO(test_input)`);
      let capturedOutput = '';
      pyodide.setStdout({
        batched: (out: string) => {
          capturedOutput += out + '\n';
        },
      });
      await pyodide.runPythonAsync(userCode);
      setOutput(capturedOutput.trim());
    } catch (e: any) {
      setError(e.message);
    } finally {
      pyodide.setStdout({});
      setIsRunning(false);
    }
  };
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
          <strong>예상 출력:</strong> {testCase.expectedOutput}
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

export const TeacherProblemDetailView: React.FC<TeacherProblemDetailViewProps> = ({
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
      <header className="flex items-center mb-4">
        <button onClick={onBackToList} className="p-1 rounded-full hover:bg-slate-700 mr-3">
          <img src={backIcon} alt="목록으로" className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold truncate">{problem.title}</h1>
      </header>
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-grow my-4 overflow-y-auto pr-2">
        {activeTab === 'problem' ? (
          <ProblemDescription problem={problem} />
        ) : (
          <TestCaseViewer testCases={testCases} userCode={userCode} pyodide={pyodide} />
        )}
      </main>
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

export default TeacherProblemDetailView;
