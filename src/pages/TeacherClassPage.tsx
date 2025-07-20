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
import VoiceChatModal from '../components/common/VoiceChatModal';
import { useVoiceChat } from '../hooks/useVoiceChat';
import { useAuthStore } from '../store/authStore';
// 안내 메시지 아이콘용 import 추가
// import { FaQuestionCircle } from 'react-icons/fa'; // react-icons import 제거

interface SVGLine {
  points: [number, number][];
  color: string;
}

const TeacherClassPage: React.FC = () => {
  const { initialize, terminate } = useWorkerStore(); // 2. 워커 함수 가져오기

  // 3. 워커 생명주기 관리 useEffect 추가
  useEffect(() => {
    initialize();
    return () => {
      terminate();
    };
  }, []); // 빈 배열로 변경하여 컴포넌트 마운트/언마운트 시에만 워커 관리

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

  const [svgLines, setSvgLines] = useState<SVGLine[]>([]);
  const [studentSvgLines, setStudentSvgLines] = useState<Map<number, SVGLine[]>>(new Map());
  // 협업 중에 학생이 문제를 바꾼 정보를 임시 저장 (ref로 관리하여 최신 값 보장)
  const pendingStudentProblemChangeRef = useRef<{
    studentId: number;
    problemId: number;
  } | null>(null);

  // 음성채팅 팝업 상태
  const [isVoiceChatOpen, setIsVoiceChatOpen] = useState(false);
  const [isRoomJoined, setIsRoomJoined] = useState(false);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

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
    otherCursor,
    setOtherCursor,
    setStudentCurrentProblem,
  } = useTeacherStore();
  const { submitCode, isSubmitting, analysisResult, detailedAnalysis, isAnalyzing, closeAnalysis } =
    useSubmissionStore();
  // userCode, setUserCode 제거
  const [mode, setMode] = useState<'grid' | 'editor'>('grid');
  const { user } = useAuthStore();

  // 현재 보고 있는 문제 id를 항상 최신으로 유지
  const currentProblemIdRef = useRef<number | null>(selectedProblemId);
  useEffect(() => {
    console.log('[Teacher] selectedProblemId 변경:', selectedProblemId);
    currentProblemIdRef.current = selectedProblemId;
    // 문제가 변경되면 다른 사용자의 커서 초기화
    setOtherCursor(null);
  }, [selectedProblemId]);

  // 음성채팅 훅 사용
  const voiceChat = useVoiceChat({
    roomId: roomId!,
    userName: user?.name || '',
    userRole: 'teacher',
  });

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

    socket.on('room:joined', (data) => {
      console.log('[Teacher] room:joined', data);
      setIsRoomJoined(true); // 방 입장 완료 시 상태 업데이트
    });
    socket.on('room:full', () => console.log('[Teacher] room:full'));
    socket.on('room:notfound', () => console.log('[Teacher] room:notfound'));

    socket.on('collab:started', ({ collaborationId, problemId }) => {
      console.log('[Teacher] collab:started', collaborationId, 'problemId:', problemId);
      setCollaborationId(collaborationId);
      setIsConnectingToStudent(false); // 협업 시작 완료
      // 협업 시작 시에만 문제 자동 이동
      if (problemId) {
        selectProblem(problemId);
      }
      // 협업이 시작되면 에디터 모드로 전환
      setMode('editor');
    });

    socket.on('code:send', ({ collaborationId, problemId, code }) => {
      const parts = collaborationId.split('_');
      const studentId = Number(parts[parts.length - 1]);
      setCollaborationId(collaborationId);
      console.log('[Teacher] code:send 수신', { collaborationId, problemId, code, studentId });

      // 항상 학생을 선택된 상태로 설정
      setSelectedStudentId(studentId);
      if (problemId) {
        selectProblem(problemId);
        updateStudentCodeFromCollaborationId(collaborationId, problemId, code);
        setInfoMessage(null);

        // 협업 시작 시 현재 문제 정보도 설정
        setStudentCurrentProblem(studentId, problemId);
        console.log('[Teacher] code:send에서 현재 문제 정보 설정:', { studentId, problemId });
      } else {
        selectProblem(null);
        setInfoMessage('학생이 문제를 선택하면 코드 에디터가 열립니다.');
      }
    });

    socket.on('code:update', ({ collaborationId, problemId, code }) => {
      const parts = collaborationId.split('_');
      const studentId = Number(parts[parts.length - 1]);
      console.log('[Teacher] code:update 수신', { collaborationId, problemId, code, studentId });
      updateStudentCodeFromCollaborationId(collaborationId, problemId, code);

      // 협업 중 코드 편집 시에도 현재 문제 정보 업데이트
      if (problemId) {
        setStudentCurrentProblem(studentId, problemId);
        console.log('[Teacher] code:update에서 현재 문제 정보 업데이트:', { studentId, problemId });
      }

      // 문제 자동 전환 제거: 학생이 코드를 입력해도 선생님 화면이 자동 이동하지 않음
      // if (collaborationId && problemId) {
      //   selectProblem(problemId);
      // }
    });

    socket.on('collab:ended', () => {
      console.log('[Teacher] collab:ended - 협업 세션 종료');

      // 협업 종료 시 현재 선택된 학생과 문제 정보를 그리드에 확실히 반영
      if (selectedStudentId && selectedProblemId) {
        console.log('[Teacher] 협업 종료 시 그리드에 최신 문제 정보 반영:', {
          selectedStudentId,
          selectedProblemId,
        });
        setStudentCurrentProblem(selectedStudentId, selectedProblemId);
      } else if (pendingStudentProblemChangeRef.current) {
        // pendingStudentProblemChangeRef에 저장된 정보로도 업데이트
        const { studentId, problemId } = pendingStudentProblemChangeRef.current;
        console.log('[Teacher] 협업 종료 시 pending 정보로 그리드 업데이트:', {
          studentId,
          problemId,
        });
        setStudentCurrentProblem(studentId, problemId);
      }

      // 협업 종료 시 학생이 바꾼 문제 정보 확인 (이미 실시간 반영되었으므로 로그만 출력)
      if (pendingStudentProblemChangeRef.current) {
        console.log(
          '[Teacher] 협업 종료 시 학생 문제 변경 확인 (이미 반영됨):',
          pendingStudentProblemChangeRef.current,
        );
        pendingStudentProblemChangeRef.current = null; // 초기화
      } else {
        console.log('[Teacher] 협업 종료 시 학생 문제 변경 없음');
      }

      setCollaborationId(null);
      setSelectedStudentId(null);
      setIsConnectingToStudent(false); // 협업 종료 시 연결 상태 초기화
      setMode('grid'); // 협업 종료 시 자동으로 그리드 뷰로 전환
      // 협업 종료 시 현재 학생의 그림 데이터 저장
      if (selectedStudentId) {
        setStudentSvgLines((prev) => new Map(prev.set(selectedStudentId, svgLines)));
        setSvgLines([]); // 현재 그림 초기화
      }
      // 협업 종료 시 커서 상태도 초기화
      setOtherCursor(null);
    });

    // SVG 관련 이벤트 리스너
    socket.on('svgData', (data: { lines: SVGLine[] }) => {
      console.log('[Teacher] svgData 수신', data.lines?.length || 0, '개 라인');
      setSvgLines(data.lines || []);
    });

    socket.on('svgCleared', () => {
      console.log('[Teacher] svgCleared 수신');
      setSvgLines([]);
    });

    // 소켓 연결 해제 시 그림 자동 지우기
    socket.on('disconnect', () => {
      console.log('[Teacher] 소켓 연결 해제 - 그림 자동 지우기');
      setSvgLines([]);
    });

    socket.on('cursor:update', ({ lineNumber, column, problemId }) => {
      const currentProblemId = currentProblemIdRef.current;
      console.log('[Teacher] cursor:update 수신', {
        lineNumber,
        column,
        problemId,
        currentProblemId,
        isMatch: problemId === currentProblemId,
      });
      // 현재 보고 있는 문제와 같을 때만 커서 표시
      if (problemId && currentProblemId && problemId === currentProblemId) {
        console.log('[Teacher] 커서 표시:', { lineNumber, column, problemId });
        setOtherCursor({ lineNumber, column, problemId });
      } else {
        console.log('[Teacher] 다른 문제를 보고 있어서 커서 숨김');
        setOtherCursor(null);
      }
    });

    socket.on('problem:selected', ({ collaborationId, problemId }) => {
      console.log('[Teacher] problem:selected 수신', { collaborationId, problemId });
      const parts = collaborationId.split('_');
      const studentId = Number(parts[parts.length - 1]);
      if (problemId) {
        selectProblem(problemId);
        setSelectedStudentId(studentId); // 학생이 문제를 선택하면 해당 학생으로 자동 전환
        setInfoMessage(null);
      } else {
        setInfoMessage('학생이 문제를 선택하면 코드 에디터가 열립니다.');
      }
    });

    socket.on('student:problem:selected', ({ roomId, studentId, problemId }) => {
      // 협업 중에 학생이 문제를 바꾸면 실시간으로 그리드에 반영 + 임시 저장
      console.log('[Teacher] 학생 문제 변경 실시간 반영 + 임시 저장:', { studentId, problemId });
      setStudentCurrentProblem(studentId, problemId); // 실시간 반영
      pendingStudentProblemChangeRef.current = { studentId, problemId }; // 협업 종료 시 재적용용
    });

    socket.on('student:currentProblem', ({ roomId, studentId, problemId }) => {
      // 학생이 현재 풀고 있는 문제 변경 시 그리드에 실시간 반영
      console.log('[Teacher] student:currentProblem 수신:', { roomId, studentId, problemId });
      setStudentCurrentProblem(studentId, problemId);
      console.log('[Teacher] studentCurrentProblem 업데이트 완료:', { studentId, problemId });
    });

    socket.on('collab:edit', ({ collaborationId, problemId, code }) => {
      const parts = collaborationId.split('_');
      const studentId = Number(parts[parts.length - 1]);
      setCollaborationId(collaborationId);
      if (problemId) {
        setSelectedStudentId(studentId);
        selectProblem(problemId);
        updateStudentCodeFromCollaborationId(collaborationId, problemId, code);
        setInfoMessage(null);

        // 협업 중 문제 변경 시 그리드에도 즉시 반영 (강제 업데이트)
        setStudentCurrentProblem(studentId, problemId);
        console.log('[Teacher] collab:edit에서 현재 문제 정보 강제 업데이트:', {
          studentId,
          problemId,
        });

        // 추가: pendingStudentProblemChangeRef에도 저장
        pendingStudentProblemChangeRef.current = { studentId, problemId };
      }
    });

    return () => {
      socket.off('room:joined');
      socket.off('room:full');
      socket.off('room:notfound');
      socket.off('collab:started');
      socket.off('code:send');
      socket.off('code:update');
      socket.off('collab:ended');
      socket.off('cursor:update');
      socket.off('svgData');
      socket.off('svgCleared');
      socket.off('disconnect');
      socket.off('problem:selected');
      socket.off('student:problem:selected');
      socket.off('student:currentProblem');
      socket.off('collab:edit');

      // void만 리턴 (아무것도 리턴하지 않음)
    };
  }, []); // ← 빈 배열!

  // 최초 진입 시 한 번만 fetchRoomDetails 호출
  useEffect(() => {
    if (!roomId) return;
    fetchRoomDetails(roomId).catch((err: any) => {
      if (err?.response?.status === 403 || err?.response?.status === 404) {
        navigate('/not-found');
      }
    });
  }, [roomId, fetchRoomDetails, navigate]);

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

  // 협업 상태를 localStorage에 저장
  useEffect(() => {
    if (selectedStudentId !== null && selectedProblemId !== null && roomId && inviteCode) {
      localStorage.setItem(
        'lastCollab',
        JSON.stringify({
          roomId,
          inviteCode,
          studentId: selectedStudentId,
          problemId: selectedProblemId,
        }),
      );
    } else {
      localStorage.removeItem('lastCollab');
    }
  }, [selectedStudentId, selectedProblemId, roomId, inviteCode]);

  // 페이지 로드 시 자동 collab:start 복구
  useEffect(() => {
    const lastCollab = localStorage.getItem('lastCollab');
    if (lastCollab) {
      try {
        const { roomId, inviteCode, studentId } = JSON.parse(lastCollab);
        if (roomId && inviteCode && studentId) {
          socket.emit('collab:start', { roomId, inviteCode, studentId });
          setSelectedStudentId(studentId);
        }
      } catch {}
    }
  }, [roomId, inviteCode]);

  // 문제 전환 시 커서 상태 초기화
  useEffect(() => {
    setOtherCursor(null);
  }, [selectedProblemId]);

  // 학생이 코드를 보내면 해당 문제의 코드를 업데이트하는 리스너 추가
  useEffect(() => {
    socket.on('student:sendCode', ({ problemId, code }) => {
      if (problemId != null && selectedStudentId != null) {
        updateStudentCode(selectedStudentId, problemId, code);
      }
    });
    return () => {
      socket.off('student:sendCode');
    };
  }, [selectedStudentId]);

  //console.log('현재 스토어의 currentRoom 상태:', currentRoom);

  const handleToggleClass = async (currentTimer?: string) => {
    setLocalClassStarted((prev) => !prev);
    if (roomId) {
      if (classStatus === 'IN_PROGRESS') {
        try {
          await updateRoomStatus(roomId, currentTimer);
          useTeacherStore.getState().resetStore(); // 수업 종료 시 상태 초기화
          localStorage.removeItem('lastRoomId'); // 수업 종료 시 roomId도 삭제
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
    console.log('[Teacher] handleSelectProblem 호출:', problemId);
    selectProblem(problemId);

    // 문제가 변경되면 분석 패널 닫기
    if (isAnalysisPanelOpen) {
      setAnalysisPanelOpen(false);
      closeAnalysis();
    }

    if (collaborationId && problemId != null) {
      socket.emit('teacher:requestStudentCode', { collaborationId, problemId });
    }
  };

  // 에디터에 표시할 코드
  const code =
    mode === 'editor' && selectedStudentId === null
      ? teacherCode
      : selectedStudentId !== null && selectedProblemId !== null
        ? studentCodes[selectedStudentId]?.[selectedProblemId] || ''
        : teacherCode;

  // 코드 변경 핸들러
  const handleCodeChange = (code: string | undefined) => {
    if (selectedStudentId !== null && selectedProblemId !== null) {
      updateStudentCode(selectedStudentId, selectedProblemId, code || '');
      if (collaborationId) {
        socket.emit('collab:edit', {
          collaborationId,
          problemId: selectedProblemId,
          code: code || '',
        });
      }
    } else {
      setTeacherCode(code || '');
    }
  };

  // 커서 위치 변경 핸들러
  const handleCursorChange = (position: { lineNumber: number; column: number }) => {
    // 협업 세션이 있고, 문제를 선택했을 때만 커서 동기화
    if (collaborationId && selectedProblemId) {
      console.log('[Teacher] cursor 위치 변경 → 서버로 emit', {
        position,
        problemId: selectedProblemId,
        collaborationId,
      });
      socket.emit('cursor:update', {
        collaborationId,
        lineNumber: position.lineNumber,
        column: position.column,
        problemId: selectedProblemId,
      });
    } else {
      console.log(
        '[Teacher] 커서 전송 스킵 - 협업세션:',
        !!collaborationId,
        '문제선택:',
        !!selectedProblemId,
      );
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
  //console.log('currentRoom.participants:', currentRoom?.participants);
  //console.log('studentsWithoutTeacher:', studentsWithoutTeacher);

  // 헬퍼 함수: collaborationId에서 studentId 추출하여 코드 업데이트
  const updateStudentCodeFromCollaborationId = (
    collaborationId: string,
    problemId: number,
    code: string,
  ) => {
    const parts = collaborationId.split('_');
    const studentId = Number(parts[parts.length - 1]);
    if (!isNaN(studentId) && problemId) {
      updateStudentCode(studentId, problemId, code);
    }
  };

  // 모드 전환 핸들러: 그리드로 돌아갈 때 이전 협업 세션 종료
  const handleModeChange = (newMode: 'grid' | 'editor') => {
    if (newMode === 'grid') {
      // 그리드로 돌아갈 때 현재 상태를 기억
      if (selectedStudentId !== null) {
        setPreviousEditorState('student');
        // 현재 학생의 그림 데이터 저장
        setStudentSvgLines((prev) => new Map(prev.set(selectedStudentId, svgLines)));
      } else {
        setPreviousEditorState('teacher');
      }

      // 협업 세션이 있으면 종료
      if (collaborationId) {
        console.log('모드 전환: 그리드로 이동하면서 협업 세션 종료', collaborationId);

        // 협업 종료 시 학생이 바꾼 문제 정보 확인 (이미 실시간 반영되었으므로 로그만 출력)
        if (pendingStudentProblemChangeRef.current) {
          console.log(
            '[Teacher] 모드 전환 시 학생 문제 변경 확인 (이미 반영됨):',
            pendingStudentProblemChangeRef.current,
          );
          pendingStudentProblemChangeRef.current = null; // 초기화
        }

        socket.emit('collab:end', { collaborationId });
        setCollaborationId(null);
        setSelectedStudentId(null);
        setSvgLines([]); // 그림 초기화
      }
    } else if (newMode === 'editor') {
      // 무조건 선생님 에디터로 전환
      setSelectedStudentId(null);
      selectProblem(null); // 문제 선택도 해제
      setInfoMessage(null); // 안내 메시지 제거
      setSvgLines([]); // 그림 초기화
    }
    setMode(newMode);
  };

  // 학생 선택 핸들러: 학생 선택 시 에디터 모드로 전환 + 협업 시작
  const handleStudentSelect = (studentId: number | null) => {
    console.log('[Teacher] handleStudentSelect 호출:', studentId);

    // 1) 이미 열려 있는 협업이 있으면 종료
    if (collaborationId) {
      console.log('[Teacher] 기존 협업 세션 종료:', collaborationId);
      socket.emit('collab:end', { collaborationId });
      setCollaborationId(null);
    }

    // 2) 이전 선택 지우기
    setSelectedStudentId(null);

    // 3) 새 학생 선택 및 협업 시작 요청
    if (studentId !== null && inviteCode) {
      console.log('[Teacher] 새 학생 선택 및 협업 시작 요청:', { studentId, inviteCode });
      setSelectedStudentId(studentId); // 학생 ID만 설정
      setIsConnectingToStudent(true); // "연결 중..." 상태
      setInfoMessage(null); // 이전 안내 메시지 제거

      // 학생 상태 추측/세팅 로직 모두 제거
      // 서버로 협업 시작 요청만 보냄
      if (socket.connected) {
        socket.emit('collab:start', { roomId, inviteCode, studentId });
      } else {
        console.log('[Teacher] 소켓 연결 중, 연결 후 협업 시작 요청');
        socket.once('connect', () => {
          socket.emit('collab:start', { roomId, inviteCode, studentId });
        });
        socket.connect();
      }
    }
  };

  // 내 코드로 전환 핸들러: 협업 종료 emit
  const handleReturnToTeacher = () => {
    // 협업 종료 시 학생이 바꾼 문제 정보 확인 (이미 실시간 반영되었으므로 로그만 출력)
    if (pendingStudentProblemChangeRef.current) {
      console.log(
        '[Teacher] 내 코드로 전환 시 학생 문제 변경 확인 (이미 반영됨):',
        pendingStudentProblemChangeRef.current,
      );
      pendingStudentProblemChangeRef.current = null; // 초기화
    }

    if (collaborationId) {
      socket.emit('collab:end', { collaborationId });
    }
    // 현재 학생의 그림 데이터 저장
    if (selectedStudentId) {
      setStudentSvgLines((prev) => new Map(prev.set(selectedStudentId, svgLines)));
    }
    setSelectedStudentId(null);
    selectProblem(null); // 내 코드 보기 시 문제 선택도 해제
    setCollaborationId(null);
    setIsConnectingToStudent(false); // 연결 상태 초기화
    setPreviousEditorState('teacher'); // 선생님 에디터 상태로 기록
    setSvgLines([]); // 그림 초기화
  };

  // SVG 관련 핸들러 함수들
  const handleAddSVGLine = (line: SVGLine) => {
    const newLines = [...svgLines, line];
    setSvgLines(newLines);
    // 실시간으로 다른 사용자에게 전송 (협업 세션이 있을 때만)
    if (collaborationId) {
      console.log('[Teacher] SVG 라인 추가 및 전송:', collaborationId, newLines.length, '개 라인');
      socket.emit('updateSVG', {
        collaborationId,
        lines: newLines,
      });
    } else {
      console.log('[Teacher] 협업 세션이 없어서 SVG 전송 안함');
    }
  };

  const handleClearSVGLines = () => {
    setSvgLines([]);
    if (collaborationId) {
      console.log('[Teacher] SVG 클리어 및 전송:', collaborationId);
      socket.emit('clearSVG', { collaborationId });
    } else {
      console.log('[Teacher] 협업 세션이 없어서 SVG 클리어 전송 안함');
    }
  };

  const handleSetSVGLines = (lines: SVGLine[]) => {
    setSvgLines(lines);
  };

  if (isRoomLoading && !currentRoom) {
    return (
      <div className="h-screen bg-slate-900 flex items-center justify-center">
        {/* 학생 페이지와 동일하게, 스피너와 문구를 모두 삭제하여 배경색만 남김 */}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white min-h-[600px]">
      <TeacherHeader
        classCode={currentRoom?.inviteCode || '...'}
        mode={mode}
        onModeChange={handleModeChange}
        isClassStarted={localClassStarted}
        onToggleClass={handleToggleClass}
        title={currentRoom?.title || '수업 제목'}
        onVoiceChatToggle={() => setIsVoiceChatOpen(!isVoiceChatOpen)}
        roomId={roomId}
      />

      {/* 음성채팅 팝업 */}
      <VoiceChatModal
        isOpen={isVoiceChatOpen}
        onClose={() => setIsVoiceChatOpen(false)}
        isMuted={voiceChat.isMuted}
        onToggleMute={voiceChat.toggleMute}
        isEnabled={voiceChat.isEnabled}
        onToggleEnabled={voiceChat.toggleEnabled}
        volume={voiceChat.volume}
        onVolumeChange={voiceChat.handleVolumeChange}
        participants={voiceChat.participants}
        onToggleParticipantMute={voiceChat.toggleParticipantMute}
        onParticipantVolumeChange={voiceChat.handleParticipantVolumeChange}
        userId={String(teacherId)}
      />
      <main className="flex flex-grow overflow-hidden min-h-[500px]">
        <TeacherProblemPanel
          problems={currentRoom?.problems || []}
          userCode={code}
          onSubmit={handleSubmit}
          selectedProblemId={selectedProblemId}
          onSelectProblem={handleSelectProblem}
        />
        <div className="flex flex-grow min-w-0">
          {mode === 'grid' ? (
            <StudentGridView
              key={JSON.stringify(studentsWithoutTeacher.map((s: any) => s.userId))}
              students={studentsWithoutTeacher}
              onStudentSelect={handleStudentSelect}
              isConnecting={isConnectingToStudent}
            />
          ) : (
            <>
              <div className="flex-grow min-w-0 min-h-[400px]">
                {selectedStudentId === null ? (
                  <TeacherEditorPanel
                    code={code}
                    onCodeChange={handleCodeChange}
                    selectedStudentId={null}
                    studentName={teacherName}
                    onClickReturnToTeacher={undefined}
                    isConnecting={false}
                    otherCursor={null}
                    onCursorChange={handleCursorChange}
                    roomId={roomId}
                    userId={String(teacherId)}
                    role="teacher"
                    svgLines={svgLines}
                    onAddSVGLine={handleAddSVGLine}
                    onClearSVGLines={handleClearSVGLines}
                    onSetSVGLines={handleSetSVGLines}
                    problemId={selectedProblemId} // ← 추가
                    isAnalysisPanelOpen={isAnalysisPanelOpen} // 분석 패널 상태 전달
                  />
                ) : isConnectingToStudent ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-3"></div>
                    <p className="text-sm">학생과 연결 중...</p>
                    <p className="text-xs text-slate-500 mt-1">잠시만 기다려주세요</p>
                  </div>
                ) : selectedStudentId !== null && selectedProblemId !== null ? (
                  <TeacherEditorPanel
                    code={code}
                    onCodeChange={handleCodeChange}
                    selectedStudentId={selectedStudentId}
                    studentName={studentName}
                    onClickReturnToTeacher={handleReturnToTeacher}
                    isConnecting={isConnectingToStudent}
                    otherCursor={otherCursor}
                    onCursorChange={handleCursorChange}
                    roomId={roomId}
                    userId={String(teacherId)}
                    role="teacher"
                    svgLines={svgLines}
                    onAddSVGLine={handleAddSVGLine}
                    onClearSVGLines={handleClearSVGLines}
                    onSetSVGLines={handleSetSVGLines}
                    problemId={selectedProblemId} // ← 추가
                    isAnalysisPanelOpen={isAnalysisPanelOpen} // 분석 패널 상태 전달
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-slate-900 bg-opacity-80">
                    <svg
                      className="mb-4 animate-bounce"
                      width="72"
                      height="72"
                      viewBox="0 0 72 72"
                      fill="none"
                    >
                      <text
                        x="36"
                        y="56"
                        textAnchor="middle"
                        fontSize="60"
                        fontWeight="bold"
                        fill="#38bdf8"
                        fontFamily="Arial, sans-serif"
                      >
                        ?
                      </text>
                    </svg>
                    <p className="text-2xl font-bold text-blue-300 mb-2 text-center">
                      문제를 선택해 주세요
                    </p>
                    <p className="text-base text-slate-400 text-center">
                      왼쪽에서 문제를 선택하면
                      <br />
                      학생의 코드 에디터가 열립니다.
                    </p>
                  </div>
                )}
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
                  isAnalyzing={isAnalyzing}
                  detailedAnalysis={detailedAnalysis}
                  problemId={selectedProblemId?.toString()}
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
