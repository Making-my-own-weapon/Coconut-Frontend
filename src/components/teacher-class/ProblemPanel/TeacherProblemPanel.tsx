import React, { useState, useMemo } from 'react';
import { useTeacherStore } from '../../../store/teacherStore';
import TeacherProblemListView from './TeacherProblemListView';
import TeacherProblemDetailView from './TeacherProblemDetailView';
import ProblemCreateForm from '../ProblemCreateForm';
import ProblemImportForm from '../ProblemImportForm';
import { type Problem } from '../../../store/teacherStore';

// 이 컴포넌트가 부모로부터 받는 props 타입
interface TeacherProblemPanelProps {
  problems: Problem[];
  userCode: string;
  onSubmit: () => void;
  selectedProblemId: number | null;
  onSelectProblem: (problemId: number | null) => void;
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
        &times;
      </button>
      {children}
    </div>
  </div>
);

export const TeacherProblemPanel: React.FC<TeacherProblemPanelProps> = ({
  problems,
  userCode,
  onSubmit,
  selectedProblemId,
  onSelectProblem,
}) => {
  const { fetchRoomDetails, currentRoom } = useTeacherStore();
  const roomId = currentRoom?.roomId;

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isImportModalOpen, setImportModalOpen] = useState(false);

  const selectedProblem = useMemo(
    () => problems.find((p) => p.problemId === selectedProblemId) || null,
    [selectedProblemId, problems],
  );

  const closeCreate = () => {
    setCreateModalOpen(false);
    if (roomId) fetchRoomDetails(String(roomId));
  };
  const closeImport = () => {
    setImportModalOpen(false);
    if (roomId) fetchRoomDetails(String(roomId));
  };

  return (
    <>
      <aside className="w-[360px] h-full bg-slate-800 border-r border-slate-700">
        {selectedProblem ? (
          <TeacherProblemDetailView
            problem={selectedProblem}
            onBackToList={() => onSelectProblem(null)}
            onSubmit={onSubmit}
            userCode={userCode}
          />
        ) : (
          <TeacherProblemListView
            problems={problems}
            onSelectProblem={onSelectProblem}
            onOpenCreateModal={() => setCreateModalOpen(true)}
            onOpenImportModal={() => setImportModalOpen(true)}
          />
        )}
      </aside>

      {/* 모달 렌더링 부분 */}
      {isCreateModalOpen && (
        <Modal onClose={closeCreate}>
          <ProblemCreateForm onClose={closeCreate} />
        </Modal>
      )}
      {isImportModalOpen && (
        <Modal onClose={closeImport}>
          <ProblemImportForm onClose={closeImport} />
        </Modal>
      )}
    </>
  );
};

export default TeacherProblemPanel;
