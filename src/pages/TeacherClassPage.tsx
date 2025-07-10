import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTeacherStore, type Student } from '../store/teacherStore';
import { useSubmissionStore } from '../store/submissionStore';
import { useWorkerStore } from '../store/workerStore'; // 1. workerStore import
import socket from '../lib/socket';
import TeacherHeader from '../components/teacher-class/Header';
import TeacherProblemPanel from '../components/teacher-class/ProblemPanel/TeacherProblemPanel';
import TeacherEditorPanel from '../components/teacher-class/EditorPanel/EditorPanel';
import TeacherAnalysisPanel from '../components/teacher-class/AnalysisPanel';
import StudentGridView from '../components/teacher-class/grid/StudentGridView';
import { useAuthStore } from '../store/authStore';

const TeacherClassPage: React.FC = () => {
  const { initialize, terminate } = useWorkerStore(); // 2. 워커 함수 가져오기

  // 3. 워커 생명주기 관리 useEffect 추가
  useEffect(() => {
    initialize();
    return () => {
      terminate();
    };
  }, [initialize, terminate]);

  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [isAnalysisPanelOpen, setAnalysisPanelOpen] = useState(false);
  const [collaborationId, setCollaborationId] = useState<string | null>(null);
  const [isConnectingToStudent, setIsConnectingToStudent] = useState(false);
  const [previousEditorState, setPreviousEditorState] = useState<'teacher' | 'student' | null>(
    null,
  );
  // (타이머 관련 상태, useEffect, props 모두 삭제)
  const [seconds, setSeconds] = useState(0);
  const [, forceUpdate] = useState(0);

  const {
    currentRoom,
    classStatus,
    students,
    selectedStudentId,
    selectedProblemId,
    isLoading: isRoomLoading,
    fetchRoomDetails,
    updateRoomStatus,
    setSelectedStudentId,
    selectProblem,
    teacherCode,
    studentCodes,
    setTeacherCode,
    updateStudentCode,
  } = useTeacherStore();
  const { submitCode, isSubmitting, analysisResult, closeAnalysis } = useSubmissionStore();
  // userCode, setUserCode 제거
  const [mode, setMode] = useState<'grid' | 'editor'>('grid');
  const { user } = useAuthStore();

  // 즉시 반영되는 수업 상태 (UI용)
  const [localClassStarted, setLocalClassStarted] = useState(classStatus === 'IN_PROGRESS');
  useEffect(() => {
    setLocalClassStarted(classStatus === 'IN_PROGRESS');
  }, [classStatus]);

  // 선생님 userId, 이름 추출 (participants 중 role이 teacher인 사람)
  const teacher = currentRoom?.participants?.find((p: any) => p.role === 'teacher');
  const teacherId = teacher?.userId;
  const teacherName = teacher?.name;
  const inviteCode = currentRoom?.inviteCode;

  // 1) 소켓 연결 & 리스너 등록 (빈 배열 → 마운트/언마운트 때만)
  useEffect(() => {
    socket.connect();

    socket.on('room:joined', (data) => console.log('[Teacher] room:joined', data));
    socket.on('room:full', () => console.log('[Teacher] room:full'));
    socket.on('room:notfound', () => console.log('[Teacher] room:notfound'));

    socket.on('collab:started', ({ collaborationId }) => {
      console.log('[Teacher] collab:started', collaborationId);
      setCollaborationId(collaborationId);
      setIsConnectingToStudent(false); // 협업 시작 완료
    });

    socket.on('code:send', ({ collaborationId, code }) => {
      console.log('[Teacher] code:send', { collaborationId, code });
      updateStudentCodeFromCollaborationId(collaborationId, code);
      setCollaborationId(collaborationId);
    });

    socket.on('code:update', ({ collaborationId, code }) => {
      console.log('[Teacher] code:update 수신', { collaborationId, code });
      updateStudentCodeFromCollaborationId(collaborationId, code);
    });

    socket.on('collab:ended', () => {
      console.log('[Teacher] collab:ended');
      setCollaborationId(null);
      setSelectedStudentId(null);
      setIsConnectingToStudent(false); // 협업 종료 시 연결 상태 초기화
    });

    return () => {
      socket.off('room:joined');
      socket.off('room:full');
      socket.off('room:notfound');
      socket.off('collab:started');
      socket.off('code:send');
      socket.off('code:update');
      socket.off('collab:ended');
      // void만 리턴 (아무것도 리턴하지 않음)
    };
  }, []); // ← 빈 배열!

  // 최초 진입 시 한 번만 fetchRoomDetails 호출
  useEffect(() => {
    if (roomId) fetchRoomDetails(roomId);
  }, [roomId, fetchRoomDetails]);

  // room:join emit - currentRoom 의존성 제거
  useEffect(() => {
    if (!roomId || !user) return;
    const teacherId = user.id;
    const teacherName = user.name;
    const inviteCode = currentRoom?.inviteCode;
    if (!inviteCode || !teacherId || !teacherName) return;
    socket.emit('room:join', {
      roomId,
      inviteCode,
      userId: teacherId,
      userName: teacherName,
      role: 'teacher',
    });
  }, [roomId, user, currentRoom?.inviteCode]);

  // room:updated 이벤트에서만 fetchRoomDetails 호출 + 강력한 디버깅 로그
  useEffect(() => {
    const handleRoomUpdated = () => {
      if (roomId) {
        fetchRoomDetails(roomId);
      }
    };
    socket.on('room:updated', handleRoomUpdated);
    return () => {
      socket.off('room:updated', handleRoomUpdated);
    };
  }, [roomId, fetchRoomDetails]);

  // 초를 mm:ss로 변환
  useEffect(() => {
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    // setTimer(`${mm}:${ss}`); // 타이머 상태 제거
  }, [seconds]);

  console.log('현재 스토어의 currentRoom 상태:', currentRoom);

  const handleToggleClass = async () => {
    setLocalClassStarted((prev) => !prev);
    if (roomId) {
      if (classStatus === 'IN_PROGRESS') {
        try {
          await updateRoomStatus(roomId);
          navigate(`/room/${roomId}/report`);
        } catch {
          alert('수업 종료에 실패했습니다.');
        }
      } else {
        updateRoomStatus(roomId);
      }
    }
  };

  const handleSelectProblem = (problemId: number | null) => {
    selectProblem(problemId);
  };

  // 에디터에 표시할 코드
  const code = selectedStudentId !== null ? studentCodes[selectedStudentId] || '' : teacherCode;

  // 코드 변경 핸들러
  const handleCodeChange = (code: string | undefined) => {
    if (selectedStudentId !== null) {
      updateStudentCode(selectedStudentId, code || '');
      // 협업 중이면 코드 동기화 emit
      if (collaborationId) {
        socket.emit('collab:edit', { collaborationId, code: code || '' });
      }
    } else {
      setTeacherCode(code || '');
    }
  };

  const handleSubmit = () => {
    if (!roomId || !selectedProblemId) {
      alert('채점할 문제를 먼저 선택해주세요.');
      return;
    }
    if (!code || code.trim() === '') {
      alert('코드를 입력한 후 제출해주세요.');
      return;
    }
    setAnalysisPanelOpen(true);
    submitCode(roomId, String(selectedProblemId), code);
  };

  const handleCloseAnalysis = () => {
    closeAnalysis();
    setAnalysisPanelOpen(false);
  };

  // 학생 이름 찾기
  const studentName =
    selectedStudentId !== null
      ? students.find((s: Student) => s.userId === selectedStudentId)?.name
      : undefined;

  // 학생만 필터링 (userType 기반으로 필터링)
  const studentsWithoutTeacher =
    currentRoom?.participants?.filter((p: any) => p.userType !== 'teacher') || [];

  // 디버깅용 로그
  console.log('currentRoom.participants:', currentRoom?.participants);
  console.log('studentsWithoutTeacher:', studentsWithoutTeacher);

  // 헬퍼 함수: collaborationId에서 studentId 추출하여 코드 업데이트
  const updateStudentCodeFromCollaborationId = (collaborationId: string, code: string) => {
    const parts = collaborationId.split('_');
    const studentId = Number(parts[parts.length - 1]);
    if (!isNaN(studentId)) {
      updateStudentCode(studentId, code);
    }
  };

  // 모드 전환 핸들러: 그리드로 돌아갈 때 이전 협업 세션 종료
  const handleModeChange = (newMode: 'grid' | 'editor') => {
    if (newMode === 'grid') {
      // 그리드로 돌아갈 때 현재 상태를 기억
      if (selectedStudentId !== null) {
        setPreviousEditorState('student');
      } else {
        setPreviousEditorState('teacher');
      }

      // 협업 세션이 있으면 종료
      if (collaborationId) {
        console.log('모드 전환: 그리드로 이동하면서 협업 세션 종료', collaborationId);
        socket.emit('collab:end', { collaborationId });
        setCollaborationId(null);
        setSelectedStudentId(null);
      }
    } else if (newMode === 'editor') {
      // 무조건 선생님 에디터로 전환
      setSelectedStudentId(null);
    }
    setMode(newMode);
  };

  // 학생 선택 핸들러: 학생 선택 시 에디터 모드로 전환 + 협업 시작
  const handleStudentSelect = (studentId: number | null) => {
    // 1) 이미 열려 있는 협업이 있으면 종료
    if (collaborationId) {
      socket.emit('collab:end', { collaborationId });
      setCollaborationId(null);
    }

    // 2) 이전 선택 지우기
    setSelectedStudentId(null);

    // 3) 새 학생 선택
    if (studentId !== null && inviteCode) {
      setSelectedStudentId(studentId);
      setMode('editor');
      setIsConnectingToStudent(true); // 학생 연결 시작

      if (socket.connected) {
        console.log('collab:start emit (immediate)', {
          roomId,
          inviteCode,
          studentId,
          connected: socket.connected,
        });
        socket.emit('collab:start', { roomId, inviteCode, studentId });
      } else {
        console.log('collab:start emit (delayed until connect)', { roomId, inviteCode, studentId });
        socket.once('connect', () => {
          socket.emit('collab:start', { roomId, inviteCode, studentId });
        });
        socket.connect();
      }
    }
  };

  // 내 코드로 전환 핸들러: 협업 종료 emit
  const handleReturnToTeacher = () => {
    if (collaborationId) {
      socket.emit('collab:end', { collaborationId });
    }
    setSelectedStudentId(null);
    setCollaborationId(null);
    setIsConnectingToStudent(false); // 연결 상태 초기화
    setPreviousEditorState('teacher'); // 선생님 에디터 상태로 기록
  };

  if (isRoomLoading && !currentRoom) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center">
        {/* 학생 페이지와 동일하게, 스피너와 문구를 모두 삭제하여 배경색만 남김 */}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white">
      <TeacherHeader
        classCode={currentRoom?.inviteCode || '...'}
        mode={mode}
        onModeChange={handleModeChange}
        isClassStarted={localClassStarted}
        onToggleClass={handleToggleClass}
        title={currentRoom?.title || '수업 제목'}
      />
      <main className="flex flex-grow overflow-hidden">
        <TeacherProblemPanel
          problems={currentRoom?.problems || []}
          userCode={code}
          onSubmit={handleSubmit}
          selectedProblemId={selectedProblemId}
          onSelectProblem={handleSelectProblem}
        />
        <div className="flex flex-grow">
          {mode === 'grid' ? (
            <StudentGridView
              key={JSON.stringify(studentsWithoutTeacher.map((s: any) => s.userId))}
              students={studentsWithoutTeacher}
              onStudentSelect={handleStudentSelect}
              isConnecting={isConnectingToStudent}
            />
          ) : (
            <>
              <div className="flex-grow">
                <TeacherEditorPanel
                  code={code}
                  onCodeChange={handleCodeChange}
                  selectedStudentId={selectedStudentId}
                  studentName={studentName}
                  onClickReturnToTeacher={handleReturnToTeacher}
                  isConnecting={isConnectingToStudent}
                />
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
                  isLoading={isSubmitting}
                  result={analysisResult}
                  onClose={handleCloseAnalysis}
                  code={code} // 에디터 코드 전달
                  isSubmitted={!!analysisResult} // 제출 여부: 결과가 있으면 true
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
