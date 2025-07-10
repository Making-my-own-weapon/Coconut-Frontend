// src/components/student-class/ProblemPanel/ProblemDetailView.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useSubmissionStore } from '../../../store/submissionStore';
import { useWorkerStore } from '../../../store/workerStore';
import backIcon from '../../../assets/back.svg';
import playIconUrl from '../../../assets/play.svg';
import SvgIcon from '../../../components/common/SvgIcon';
import type { Problem } from '../../../store/teacherStore';

// --- Props 타입 변경
interface StudentProblemDetailViewProps {
  problem: Problem;
  onBackToList: () => void;
  onSubmit: () => void;
  userCode: string;
}
// --- 서브 컴포넌트들 그대로 사용 ---

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
    if (output && output.id === testCase.id) {
      setTestOutput(output.data);
      setIsRunning(false);
    }
  }, [output, testCase.id]);

  useEffect(() => {
    if (error && error.id === testCase.id) {
      setTestError(error.data);
      setIsRunning(false);
    }
  }, [error, testCase.id]);

  const handleRunTest = () => {
    if (!userCode.trim()) {
      setTestError('코드를 입력한 후 실행해주세요.');
      setTestOutput(null);
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
              <SvgIcon src={playIconUrl} className="w-5 h-5 animate-spin" />
            ) : (
              <SvgIcon src={playIconUrl} className="w-5 h-5 text-slate-400 hover:text-white" />
            )}
          </button>
        </div>
      </div>
      <div className="text-xs font-mono text-slate-400 space-y-1">
        <p>
          <strong>입력:</strong> {testCase.input}
        </p>
        <p>
          <strong>기대 출력:</strong> {testCase.expectedOutput}
        </p>
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
}> = ({ testCases, userCode }) => (
  <div className="space-y-4">
    {testCases.map((tc) => (
      <TestCaseItem key={tc.id} testCase={tc} userCode={userCode} />
    ))}
  </div>
);

// --- 메인 컴포넌트 ---
const StudentProblemDetailView: React.FC<StudentProblemDetailViewProps> = ({
  problem,
  onBackToList,
  onSubmit,
  userCode,
}) => {
  const { isSubmitting } = useSubmissionStore();
  // workerError를 가져오던 부분을 삭제합니다.
  const [activeTab, setActiveTab] = useState<'problem' | 'test'>('problem');

  // 받아온 문제의 exampleTc를 id/input/expectedOutput 형태로 변환합니다.
  const formatted = useMemo(() => {
    try {
      const problemWithExampleTc = problem as Problem & {
        exampleTc?: { input: string; output: string }[];
        testCases?: { input: string; output?: string; expectedOutput?: string }[];
      };
      const exampleTcData = problemWithExampleTc.exampleTc;

      if (!exampleTcData || !Array.isArray(exampleTcData)) {
        // fallback: 기존 testCases 사용
        return (
          problemWithExampleTc.testCases?.map((tc, idx) => ({
            id: idx + 1,
            input: tc.input,
            expectedOutput: tc.output || tc.expectedOutput || '',
          })) || []
        );
      }
      return exampleTcData.map((tc, idx) => ({
        id: idx + 1,
        input: tc.input,
        expectedOutput: tc.output,
      }));
    } catch {
      // fallback: 기존 testCases 사용
      return (
        (
          problem as Problem & {
            testCases?: { input: string; output?: string; expectedOutput?: string }[];
          }
        ).testCases?.map((tc, idx) => ({
          id: idx + 1,
          input: tc.input,
          expectedOutput: tc.output || tc.expectedOutput || '',
        })) || []
      );
    }
  }, [problem]);

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
        {/* 불필요한 전역 에러 표시부 삭제 */}
        {activeTab === 'problem' ? (
          <ProblemDescription problem={problem} />
        ) : (
          <TestCaseViewer testCases={formatted} userCode={userCode} />
        )}
      </main>

      <footer className="mt-auto pt-4 border-t border-slate-700">
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {isSubmitting ? '채점 중...' : '제출하기'}
        </button>
      </footer>
    </div>
  );
};

export default StudentProblemDetailView;
