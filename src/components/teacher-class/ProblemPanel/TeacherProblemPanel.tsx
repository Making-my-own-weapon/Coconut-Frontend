import React, { useState, useMemo, useEffect } from 'react';
import TeacherProblemListView from './TeacherProblemListView';
import TeacherProblemDetailView from './TeacherProblemDetailView';
import type { Pyodide } from '../../../types/pyodide';
import ProblemPanel from '../../student-class/ProblemPanel/ProblemPanel';
import ProblemCreateForm from '../ProblemCreateForm';
import ProblemImportForm from '../ProblemImportForm';

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

interface TeacherProblemPanelProps {
  userCode: string;
  onSubmit: () => void;
}

// 간단한 Modal 컴포넌트 정의
const Modal: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({
  children,
  onClose,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-0 relative min-w-[400px] max-w-[90vw] max-h-[90vh] overflow-auto">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl font-bold z-10"
        aria-label="닫기"
      >
        ×
      </button>
      {children}
    </div>
  </div>
);

const TeacherProblemPanel: React.FC<TeacherProblemPanelProps> = ({ userCode, onSubmit }) => {
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [pyodide, setPyodide] = useState<Pyodide | null>(null);
  const [isPyodideLoading, setIsPyodideLoading] = useState(true);
  // 모달 상태
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);

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

  const selectedProblem = useMemo(
    () => mockProblems.find((p) => p.id === selectedProblemId) || null,
    [selectedProblemId],
  );
  const selectedTestCases = useMemo(
    () => (selectedProblemId ? mockTestCases[selectedProblemId] : []) || [],
    [selectedProblemId],
  );

  return (
    <>
      <aside className="w-[360px] h-full bg-slate-800 border-r border-slate-700">
        {isPyodideLoading ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <span>테스트 환경 로딩 중...</span>
          </div>
        ) : selectedProblem ? (
          <TeacherProblemDetailView
            problem={selectedProblem}
            testCases={selectedTestCases}
            onBackToList={() => setSelectedProblemId(null)}
            onSubmit={onSubmit}
            userCode={userCode}
            pyodide={pyodide}
          />
        ) : (
          <TeacherProblemListView
            problems={mockProblems}
            onSelectProblem={setSelectedProblemId}
            onOpenCreateModal={() => setCreateModalOpen(true)}
            onOpenImportModal={() => setImportModalOpen(true)}
          />
        )}
      </aside>
      {isCreateModalOpen && (
        <Modal onClose={() => setCreateModalOpen(false)}>
          <ProblemCreateForm onClose={() => setCreateModalOpen(false)} />
        </Modal>
      )}
      {isImportModalOpen && (
        <Modal onClose={() => setImportModalOpen(false)}>
          <ProblemImportForm onClose={() => setImportModalOpen(false)} />
        </Modal>
      )}
    </>
  );
};

export default TeacherProblemPanel;
