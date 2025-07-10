import React, { useState, useMemo, useEffect } from 'react';
import { useSubmissionStore } from '../../../store/submissionStore';
import backIcon from '../../../assets/back.svg';
import playIcon from '../../../assets/play.svg';
import type { Pyodide } from '../../../types/pyodide';
import type { Problem } from '../../../store/teacherStore';
import { useWorkerStore } from '../../../store/workerStore';

interface TeacherProblemDetailViewProps {
  problem: Problem;
  onBackToList: () => void;
  onSubmit: () => void;
  userCode: string;
}

const ProblemDescription: React.FC<{ problem: Problem }> = ({ problem }) => {
  // 마크다운 볼드 문법(**텍스트**)을 HTML로 변환
  const formatDescription = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  return (
    <div className="text-slate-300 space-y-6">
      <h2 className="text-2xl font-bold text-white">{problem.title}</h2>
      <div
        className="text-sm whitespace-pre-wrap leading-relaxed"
        dangerouslySetInnerHTML={{ __html: formatDescription(problem.description) }}
      />
    </div>
  );
};

const TestCaseItem: React.FC<{
  testCase: { id: number; input: string; expectedOutput: string };
  userCode: string;
}> = ({ testCase, userCode }) => {
  const { runCode, output, error, isReady } = useWorkerStore();
  const [isRunning, setIsRunning] = useState(false);
  const [testOutput, setTestOutput] = useState<string | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  useEffect(() => {
    // 스토어의 output ID가 이 컴포넌트의 ID와 일치할 때만 상태 업데이트
    if (output && output.id === testCase.id) {
      setTestOutput(output.data);
      setIsRunning(false);
    }
  }, [output, testCase.id]);

  useEffect(() => {
    // 스토어의 error ID가 이 컴포넌트의 ID와 일치할 때만 상태 업데이트
    if (error && error.id === testCase.id) {
      setTestError(error.data);
      setIsRunning(false);
    }
  }, [error, testCase.id]);

  const handleRunTest = () => {
    // 1. 사용자 코드가 비어있는지 확인
    if (!userCode.trim()) {
      setTestError('코드를 입력한 후 실행해주세요.');
      setTestOutput(null); // 이전 결과가 남아있지 않도록 초기화
      return;
    }
    if (!isReady) return;
    setIsRunning(true);
    setTestOutput(null);
    setTestError(null);
    runCode(userCode, { test_input: testCase.input }, testCase.id);
  };

  const isCorrect = testOutput?.trim() === testCase.expectedOutput.trim();

  return (
    <div className="bg-slate-700 p-3 rounded-md">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-white text-sm">Test Case {testCase.id}</h4>
        <div className="flex items-center gap-2">
          {!isReady && <span className="text-xs text-slate-400">테스트 환경 준비 중...</span>}
          <button
            onClick={handleRunTest}
            disabled={isRunning || !isReady}
            className="disabled:opacity-50"
          >
            {isRunning ? (
              <img src={playIcon} alt="실행 중" className="w-5 h-5 animate-spin" />
            ) : (
              <img src={playIcon} alt="실행" className="w-5 h-5 text-slate-400 hover:text-white" />
            )}
          </button>
        </div>
      </div>
      <div className="text-xs font-mono text-slate-400 space-y-1">
        <p>
          <strong>입력:</strong> {testCase.input}
        </p>
        <p>
          <strong>예상 출력:</strong> {testCase.expectedOutput}
        </p>
        {/* hasRun 플래그 대신 testOutput이나 testError가 null이 아닌지로 판단 */}
        {(testOutput !== null || testError !== null) && (
          <>
            <p>
              <strong>실제 출력:</strong> {testOutput ?? '(출력 없음)'}
              {testOutput !== null && !testError && (
                <span className={`${isCorrect ? 'text-green-400' : 'text-red-400'} ml-2`}>
                  {isCorrect ? '정답' : '오답'}
                </span>
              )}
            </p>
            {testError && (
              <p className="text-red-400">
                <strong>에러:</strong> {testError}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const TestCaseViewer: React.FC<{
  testCases: { id: number; input: string; expectedOutput: string }[];
  userCode: string;
  pyodide: Pyodide | null;
  isPyodideLoading: boolean;
}> = ({ testCases, userCode, pyodide, isPyodideLoading }) => (
  <div className="space-y-4">
    {testCases.map((tc) => (
      <TestCaseItem
        key={tc.id}
        testCase={tc}
        userCode={userCode}
        pyodide={pyodide}
        isPyodideLoading={isPyodideLoading}
      />
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
}) => {
  const { isSubmitting } = useSubmissionStore();
  // `initialize`, `terminate` 호출부를 제거합니다.
  const { status, error: workerError } = useWorkerStore();
  const [activeTab, setActiveTab] = useState<'problem' | 'test'>('problem');

  // 백엔드의 problem.exampleTc -> {id, input, expectedOutput} 배열로 변환
  const problemWithExampleTc = problem as Problem & {
    exampleTc?: { input: string; output: string }[];
    testCases?: { input: string; output?: string; expectedOutput?: string }[];
  };
  const exampleTc = problemWithExampleTc.exampleTc;
  const testCases = problemWithExampleTc.testCases;
  const formattedTestCases = useMemo(() => {
    try {
      const exampleTcData = exampleTc;

      if (!exampleTcData || !Array.isArray(exampleTcData)) {
        // fallback: 기존 testCases 사용
        return (
          testCases?.map(
            (tc: { input: string; output?: string; expectedOutput?: string }, idx: number) => ({
              id: idx + 1,
              input: tc.input,
              expectedOutput: tc.output || tc.expectedOutput || '',
            }),
          ) || []
        );
      }

      return exampleTcData.map((tc: { input: string; output: string }, idx: number) => ({
        id: idx + 1,
        input: tc.input,
        expectedOutput: tc.output,
      }));
    } catch {
      // fallback: 기존 testCases 사용
      return (
        testCases?.map(
          (tc: { input: string; output?: string; expectedOutput?: string }, idx: number) => ({
            id: idx + 1,
            input: tc.input,
            expectedOutput: tc.output || tc.expectedOutput || '',
          }),
        ) || []
      );
    }
  }, [exampleTc, testCases]);

  const [pyodide, setPyodide] = useState<Pyodide | null>(null);
  const [isPyodideLoading, setIsPyodideLoading] = useState(true);

  // 워커 생명주기를 관리하던 useEffect 훅을 완전히 삭제

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
          <TestCaseViewer
            testCases={formattedTestCases}
            userCode={userCode}
            pyodide={pyodide}
            isPyodideLoading={isPyodideLoading}
          />
        )}
      </main>
      <footer className="mt-auto pt-4 border-t border-slate-700">
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white font-bold py-2 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
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
          {isSubmitting ? '채점 중...' : '채점 및 분석'}
        </button>
      </footer>
    </div>
  );
};

export default TeacherProblemDetailView;
