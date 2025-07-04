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
  const [isAnalysisPanelOpen, setAnalysisPanelOpen] = useState(false);

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

  console.log('현재 스토어의 currentRoom 상태:', currentRoom);

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
              {/* 분석 패널 열기 버튼: 패널이 닫혔을 때만 보임 */}
              {!isAnalysisPanelOpen && (
                <button
                  onClick={() => setAnalysisPanelOpen(true)}
                  className="fixed top-1/2 right-0 z-50 transform -translate-y-1/2 bg-slate-600 text-white px-2 py-3 rounded-l-lg shadow-lg hover:bg-slate-500 transition-all"
                  style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
                  aria-label="분석 패널 열기"
                >
                  <span className="text-2xl">{'<'}</span>
                </button>
              )}
              {/* 분석 패널: 열렸을 때만 보임 */}
              {isAnalysisPanelOpen && (
                <TeacherAnalysisPanel
                  isLoading={false}
                  result={null}
                  onClose={() => setAnalysisPanelOpen(false)}
                />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeacherClassPage;
