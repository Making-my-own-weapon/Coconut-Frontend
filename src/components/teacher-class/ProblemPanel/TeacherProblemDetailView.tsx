import React, { useState, useMemo } from 'react';
import backIcon from '../../../assets/back.svg';
import playIcon from '../../../assets/play.svg';
import type { Pyodide } from '../../../types/pyodide';
import type { Problem } from '../../../store/teacherStore';

interface TeacherProblemDetailViewProps {
  problem: Problem;
  onBackToList: () => void;
  onSubmit: () => void;
  userCode: string;
  pyodide: Pyodide | null;
}

const ProblemDescription: React.FC<{ problem: Problem }> = ({ problem }) => (
  <div className="text-slate-300 space-y-6">
    <h2 className="text-2xl font-bold text-white">{problem.title}</h2>
    <p className="text-sm">{problem.description}</p>
  </div>
);

const TestCaseItem: React.FC<{
  testCase: { id: number; input: string; expectedOutput: string };
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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setIsRunning(false);
    }
  };

  const isCorrect = output.trim() === testCase.expectedOutput.trim();

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
            <span className={`${isCorrect ? 'text-green-400' : 'text-red-400'} ml-2`}>
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
  testCases: { id: number; input: string; expectedOutput: string }[];
  userCode: string;
  pyodide: Pyodide | null;
}> = ({ testCases, userCode, pyodide }) => (
  <div className="space-y-4">
    {testCases.map((tc) => (
      <TestCaseItem key={tc.id} testCase={tc} userCode={userCode} pyodide={pyodide} />
    ))}
  </div>
);

const Tabs: React.FC<{
  activeTab: 'problem' | 'test';
  setActiveTab: (tab: 'problem' | 'test') => void;
}> = ({ activeTab, setActiveTab }) => {
  const base =
    'w-1/2 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-colors';
  return (
    <div className="flex w-full bg-slate-800 p-1 rounded-lg">
      <button
        onClick={() => setActiveTab('problem')}
        className={`${base} ${activeTab === 'problem' ? 'bg-slate-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
      >
        문제
      </button>
      <button
        onClick={() => setActiveTab('test')}
        className={`${base} ${activeTab === 'test' ? 'bg-slate-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
      >
        테스트
      </button>
    </div>
  );
};

const TeacherProblemDetailView: React.FC<TeacherProblemDetailViewProps> = ({
  problem,
  onBackToList,
  onSubmit,
  userCode,
  pyodide,
}) => {
  const [activeTab, setActiveTab] = useState<'problem' | 'test'>('problem');

  // 백엔드의 problem.testcases -> {id, input, expectedOutput} 배열로 변환
  const formattedTestCases = useMemo(
    () =>
      problem.testCases?.map((tc, idx) => ({
        id: idx + 1,
        input: tc.input,
        expectedOutput: tc.output,
      })) || [],
    [problem.testCases],
  );

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
          <TestCaseViewer testCases={formattedTestCases} userCode={userCode} pyodide={pyodide} />
        )}
      </main>
      <footer className="mt-auto pt-4 border-t border-slate-700">
        <button
          onClick={onSubmit}
          className="w-full bg-blue-600 text-white font-bold py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
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
