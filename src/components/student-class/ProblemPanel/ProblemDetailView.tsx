// src/components/student-class/ProblemPanel/ProblemDetailView.tsx
import React, { useState, useMemo } from 'react';
import { useSubmissionStore } from '../../../store/submissionStore';
import backIcon from '../../../assets/back.svg';
import playIconUrl from '../../../assets/play.svg';
import SvgIcon from '../../../components/common/SvgIcon';
import type { Pyodide } from '../../../types/pyodide';
import type { Problem } from '../../../store/teacherStore';

// --- Props 타입 변경
interface StudentProblemDetailViewProps {
  problem: Problem;
  onBackToList: () => void;
  onSubmit: () => void;
  userCode: string;
  pyodide: Pyodide | null;
  isPyodideLoading: boolean;
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
  pyodide: Pyodide | null;
  isPyodideLoading: boolean;
}> = ({ testCase, userCode, pyodide, isPyodideLoading }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [hasRun, setHasRun] = useState(false);

  const handleRunTest = async () => {
    if (!pyodide || !userCode) return;
    setIsRunning(true);
    setOutput('');
    setError('');
    setHasRun(true);

    try {
      // Pyodide 상태 초기화
      pyodide.setStdout({});
      pyodide.runPython('import sys; sys.stdout.flush()');

      // 타임아웃 추가 (5초)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('실행 시간 초과 (5초)')), 5000);
      });

      const executePromise = (async () => {
        pyodide.globals.set('test_input', testCase.input);
        pyodide.runPython(`import sys; from io import StringIO; sys.stdin = StringIO(test_input)`);
        let captured = '';
        pyodide.setStdout({ batched: (o: string) => (captured += o + '\n') });
        await pyodide.runPythonAsync(userCode);
        return captured.trim();
      })();

      const result = await Promise.race([executePromise, timeoutPromise]);
      setOutput(result as string);
    } catch (e: unknown) {
      // 에러 메시지 간소화
      let errorMessage = '';
      if (e instanceof Error) {
        if (e.message === '실행 시간 초과 (5초)') {
          errorMessage = e.message;
        } else {
          // Python traceback에서 마지막 에러 메시지만 추출
          const lines = e.message.split('\n');
          const lastErrorLine = lines.find(
            (line) =>
              line.includes('Error:') ||
              line.includes('Exception:') ||
              line.trim().startsWith('NameError:') ||
              line.trim().startsWith('SyntaxError:') ||
              line.trim().startsWith('ValueError:') ||
              line.trim().startsWith('TypeError:'),
          );
          errorMessage = lastErrorLine ? lastErrorLine.trim() : e.message;
        }
      } else {
        errorMessage = String(e);
      }
      setError(errorMessage);
    } finally {
      // Pyodide 상태 정리
      try {
        pyodide.setStdout({});
        pyodide.runPython('import sys; sys.stdout.flush(); sys.stdin = sys.__stdin__');
      } catch {
        // 정리 중 에러는 무시
      }
      setIsRunning(false);
    }
  };

  const isCorrect = output.trim() === testCase.expectedOutput.trim();

  return (
    <div className="bg-slate-700 p-3 rounded-md">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-white text-sm">Test Case {testCase.id}</h4>
        <div className="flex items-center gap-2">
          {isPyodideLoading && (
            <span className="text-xs text-slate-400">테스트 환경 로딩 중...</span>
          )}
          <button
            onClick={handleRunTest}
            disabled={isRunning || isPyodideLoading || !pyodide}
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
        {hasRun && (
          <p>
            <strong>실제 출력:</strong> {output || '(출력 없음)'}
            {output !== '' && (
              <span className={`${isCorrect ? 'text-green-400' : 'text-red-400'} ml-2`}>
                {isCorrect ? '정답' : '오답'}
              </span>
            )}
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

// --- 메인 컴포넌트 ---
const StudentProblemDetailView: React.FC<StudentProblemDetailViewProps> = ({
  problem,
  onBackToList,
  onSubmit,
  userCode,
  pyodide,
  isPyodideLoading,
}) => {
  const { isSubmitting } = useSubmissionStore();
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
        {activeTab === 'problem' ? (
          <ProblemDescription problem={problem} />
        ) : (
          <TestCaseViewer
            testCases={formatted}
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
          className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed"
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
          {isSubmitting ? '채점 중...' : '제출하기'}
        </button>
      </footer>
    </div>
  );
};

export default StudentProblemDetailView;
