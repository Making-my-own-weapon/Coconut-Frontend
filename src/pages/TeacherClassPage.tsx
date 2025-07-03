import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTeacherStore } from '../store/teacherStore';
import TeacherHeader from '../components/teacher-class/Header';
import TeacherProblemPanel from '../components/teacher-class/ProblemPanel/TeacherProblemPanel';
import TeacherEditorPanel from '../components/teacher-class/EditorPanel/EditorPanel';
import TeacherAnalysisPanel from '../components/teacher-class/AnalysisPanel';
import StudentGridView from '../components/teacher-class/grid/StudentGridView';

const TeacherClassPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();

  // 1. 스토어에서 classStatus와 updateRoomStatus 액션을 추가로 가져옵니다.
  const { currentRoom, classStatus, isLoading, students, fetchRoomDetails, updateRoomStatus } =
    useTeacherStore();

  const [userCode, setUserCode] = useState<string>('# 여기에 코드를 입력하세요');
  const [mode, setMode] = useState<'grid' | 'editor'>('grid');
  // 2. isClassStarted 내부 상태를 삭제합니다.
  // const [isClassStarted, setIsClassStarted] = useState(false);

  useEffect(() => {
    if (roomId) {
      fetchRoomDetails(roomId);
    }
  }, [roomId, fetchRoomDetails]);

  // 3. 핸들러가 스토어의 액션을 호출하도록 수정합니다.
  const handleToggleClass = () => {
    if (roomId) {
      updateRoomStatus(roomId);
    }
  };

  const handleCodeChange = (code: string | undefined) => setUserCode(code || '');
  const handleSubmit = () => console.log('제출된 코드:', userCode);

  if (isLoading && !currentRoom)
    return (
      <div className="h-screen bg-slate-900 text-white flex items-center justify-center">
        Loading room...
      </div>
    );

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white">
      <TeacherHeader
        classCode={currentRoom?.inviteCode || '...'}
        mode={mode}
        onModeChange={setMode}
        // 4. isClassStarted 값을 스토어의 classStatus로부터 계산합니다.
        isClassStarted={classStatus === 'STARTED'}
        onToggleClass={handleToggleClass}
      />
      <main className="flex flex-grow overflow-hidden">
        <TeacherProblemPanel userCode={userCode} onSubmit={handleSubmit} />
        <div className="flex flex-grow">
          {mode === 'grid' ? (
            <StudentGridView students={students} />
          ) : (
            <>
              <div className="flex-grow">
                <TeacherEditorPanel code={userCode} onCodeChange={handleCodeChange} />
              </div>
              <TeacherAnalysisPanel isLoading={false} result={null} onClose={() => {}} />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeacherClassPage;
