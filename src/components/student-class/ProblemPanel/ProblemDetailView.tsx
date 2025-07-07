// src/components/student-class/ProblemDetailView.tsx
import React, { useState, useMemo } from 'react';
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
      let captured = '';
      pyodide.setStdout({ batched: (o: string) => (captured += o + '\n') });
      await pyodide.runPythonAsync(userCode);
      setOutput(captured.trim());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      pyodide.setStdout({});
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
            <SvgIcon src={playIconUrl} className="w-5 h-5 animate-spin" />
          ) : (
            <SvgIcon src={playIconUrl} className="w-5 h-5 text-slate-400 hover:text-white" />
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

// --- 메인 컴포넌트 ---
const StudentProblemDetailView: React.FC<StudentProblemDetailViewProps> = ({
  problem,
  onBackToList,
  onSubmit,
  userCode,
  pyodide,
}) => {
  const [activeTab, setActiveTab] = useState<'problem' | 'test'>('problem');

  // 받아온 문제의 exampleTc를 id/input/expectedOutput 형태로 변환합니다.
  const formatted = useMemo(() => {
    try {
      const problemWithExampleTc = problem as Problem & { exampleTc?: any };
      const exampleTcData = problemWithExampleTc.exampleTc;

      if (!exampleTcData || !Array.isArray(exampleTcData)) {
        // fallback: 기존 testCases 사용
        return (
          (problem as any).testCases?.map((tc: any, idx: number) => ({
            id: idx + 1,
            input: tc.input,
            expectedOutput: tc.output || tc.expectedOutput,
          })) || []
        );
      }

      return exampleTcData.map((tc: { input: string; output: string }, idx: number) => ({
        id: idx + 1,
        input: tc.input,
        expectedOutput: tc.output,
      }));
    } catch (error) {
      // fallback: 기존 testCases 사용
      return (
        (problem as any).testCases?.map((tc: any, idx: number) => ({
          id: idx + 1,
          input: tc.input,
          expectedOutput: tc.output || tc.expectedOutput,
        })) || []
      );
    }
  }, [(problem as any).exampleTc, (problem as any).testCases]);

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
          <TestCaseViewer testCases={formatted} userCode={userCode} pyodide={pyodide} />
        )}
      </main>

      <footer className="mt-auto pt-4 border-t border-slate-700">
        <button
          onClick={onSubmit}
          className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
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
          제출하기
        </button>
      </footer>
    </div>
  );
};

export default StudentProblemDetailView;
