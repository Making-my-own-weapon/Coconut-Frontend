import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useStudentStore } from '../store/studentStore';
import { useSubmissionStore } from '../store/submissionStore';
import { useAuthStore } from '../store/authStore';
import { useWorkerStore } from '../store/workerStore';
import { Header } from '../components/student-class/Header';
import ProblemPanel from '../components/student-class/ProblemPanel/ProblemPanel';
import EditorPanel from '../components/student-class/EditorPanel/EditorPanel';
import AnalysisPanel from '../components/student-class/AnalysisPanel';
import VoiceChatModal from '../components/common/VoiceChatModal';
import { useVoiceChat } from '../hooks/useVoiceChat';
import socket from '../lib/socket';

interface SVGLine {
  points: [number, number][];
  color: string;
}

// store 초기화 훅 추가
function useRoomEntryReset(currentRoomId: string | number | null) {
  React.useEffect(() => {
    if (!currentRoomId) return;
    const lastRoomId = localStorage.getItem('lastRoomId');
    if (lastRoomId !== String(currentRoomId)) {
      // 새로운 방 입장(또는 방 생성 후 입장)
      useStudentStore.getState().resetStore();
      // 필요하다면 다른 store도 초기화
      localStorage.setItem('lastRoomId', String(currentRoomId));
    }
    // 새로고침이면 아무것도 안 함
  }, [currentRoomId]);
}

const StudentClassPage: React.FC = () => {
  const { initialize, terminate } = useWorkerStore();

  useEffect(() => {
    initialize();
    return () => {
      terminate();
    };
  }, [initialize, terminate]);

  const { roomId } = useParams<{ roomId: string }>();
  useRoomEntryReset(roomId ? String(roomId) : null);

  const {
    currentRoom,
    problems,
    codes,
    selectedProblemId,
    isLoading: isRoomLoading,
    fetchRoomDetails,
    selectProblem,
    updateCode,
    otherCursor,
    setOtherCursor,
  } = useStudentStore();

  const { submitCode, closeAnalysis } = useSubmissionStore();
  const { user } = useAuthStore();
  const myId = user?.id;
  const myName =
    currentRoom?.participants?.find((p) => p.userId === user?.id)?.name || user?.name || '';
  const inviteCode = currentRoom?.inviteCode;

  const collabIdRef = useRef<string | null>(null);
  const [userCode, setUserCode] = useState<string>('');
  const [collaborationId, setCollaborationId] = useState<string | null>(null);
  const [isAnalysisPanelOpen, setAnalysisPanelOpen] = useState(false);
  const isRemoteUpdate = useRef(false);
  const currentCodeRef = useRef<string>('');

  useEffect(() => {
    if (selectedProblemId && codes[selectedProblemId]) {
      const newCode = codes[selectedProblemId];
      if (newCode !== userCode) {
        setUserCode(newCode);
        currentCodeRef.current = newCode;
      }
    } else if (!selectedProblemId) {
      setUserCode('');
    }
  }, [selectedProblemId, codes, userCode]);

  const storeRef = useRef({ selectedProblemId, codes });
  useEffect(() => {
    storeRef.current = { selectedProblemId, codes };
  }, [selectedProblemId, codes]);

  const [roomError, setRoomError] = useState<string | null>(null);
  const [isCollabLoading, setIsCollabLoading] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  // SVG 상태 관리
  const [svgLines, setSvgLines] = useState<SVGLine[]>([]);

  // 음성채팅 팝업 상태
  const [isVoiceChatOpen, setIsVoiceChatOpen] = useState(false);
  const [isRoomJoined, setIsRoomJoined] = useState(false);

  // 음성채팅 훅 사용
  const voiceChat = useVoiceChat({
    roomId: roomId!,
    userName: user?.name || '',
    userRole: 'student',
  });

  useEffect(() => {
    if (roomId) {
      fetchRoomDetails(roomId);
    }
  }, [roomId, fetchRoomDetails]);

  useEffect(() => {
    if (roomId && inviteCode && myId && myName) {
      setIsJoiningRoom(true);
      socket.connect();
      socket.emit('room:join', {
        roomId,
        inviteCode,
        userId: myId,
        userName: myName,
        role: 'student',
      });

      socket.on('room:joined', (data) => {
        setIsJoiningRoom(false);
        setIsRoomJoined(true); // 방 입장 완료 시 상태 업데이트
        console.log('[Student] 방 입장 성공:', data.roomId, data.inviteCode);
      });
      socket.on('room:full', () => {
        setIsJoiningRoom(false);
        setRoomError('방이 가득 찼습니다!');
      });
      socket.on('room:notfound', () => {
        setIsJoiningRoom(false);
        setRoomError('방을 찾을 수 없습니다.');
      });
      socket.on('collab:started', ({ collaborationId }) => {
        setCollaborationId(collaborationId);
        collabIdRef.current = collaborationId;
        setIsCollabLoading(false);
      });
      socket.on('code:request', ({ collaborationId, teacherSocketId }) => {
        setCollaborationId(collaborationId);
        setIsCollabLoading(true);

        // Zustand store에서 최신 상태를 직접 가져옴
        const { selectedProblemId, codes } = useStudentStore.getState();
        const currentCode = selectedProblemId ? codes[selectedProblemId] || '' : '';

        socket.emit('code:send', {
          collaborationId,
          problemId: selectedProblemId,
          code: currentCode,
        });
      });
      socket.on('code:update', ({ problemId, code }) => {
        setUserCode(code); // 에디터에 코드 반영
        currentCodeRef.current = code;
        if (problemId) {
          updateCode({ problemId: problemId, code }); // 상태에도 반영
        }
      });
      socket.on('collab:ended', () => {
        setCollaborationId(null);
        collabIdRef.current = null;
        setOtherCursor(null);
      });
      socket.on('cursor:update', ({ lineNumber, column }) => {
        setOtherCursor({ lineNumber, column });
      });
      // SVG 관련 이벤트 리스너
      socket.on('svgData', (data: { lines: SVGLine[] }) => {
        console.log('[Student] svgData 수신', data.lines?.length || 0, '개 라인');
        setSvgLines(data.lines || []);
      });

      socket.on('svgCleared', () => {
        console.log('[Student] svgCleared 수신');
        setSvgLines([]);
      });

      // 소켓 연결 해제 시 그림 자동 지우기
      socket.on('disconnect', () => {
        console.log('[Student] 소켓 연결 해제 - 그림 자동 지우기');
        setSvgLines([]);
      });

      return () => {
        socket.off('room:joined');
        socket.off('room:full');
        socket.off('room:notfound');
        socket.off('collab:started');
        socket.off('code:request');
        socket.off('code:update');
        socket.off('collab:ended');
        socket.off('cursor:update');
        socket.off('svgData');
        socket.off('svgCleared');
        socket.off('disconnect');
      };
    }
  }, [roomId, inviteCode, myId, myName]);

  useEffect(() => {
    if (!roomId) return;
    const handleProblemUpdated = () => {
      fetchRoomDetails(roomId);
    };
    socket.on('problem:updated', handleProblemUpdated);
    return () => {
      socket.off('problem:updated', handleProblemUpdated);
    };
  }, [roomId, fetchRoomDetails]);

  const handleSelectProblem = (problemId: number | null) => {
    selectProblem(problemId); // 로컬 상태 업데이트

    // 항상 교사에게 현재 선택 문제를 브로드캐스트
    if (roomId && myId && problemId) {
      socket.emit('student:problem:selected', { roomId, studentId: myId, problemId });
    }

    if (collaborationId && problemId) {
      // 1. 기존처럼 문제 선택 이벤트를 보냄
      socket.emit('problem:selected', { collaborationId, problemId });
      console.log('[Student] emit problem:selected', { collaborationId, problemId });

      // 2. 해당 문제의 현재 코드도 함께 전송 (추가)
      const newCode = storeRef.current.codes[problemId] || '';
      socket.emit('collab:edit', {
        collaborationId,
        problemId: problemId,
        code: newCode,
      });
      console.log('[Student] emit collab:edit on problem select');
    }
  };

  const handleCodeChange = (code: string | undefined) => {
    if (!selectedProblemId) {
      alert('문제를 먼저 선택해 주세요!');
      return;
    }
    const newCode = code || '';
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    setUserCode(newCode);
    currentCodeRef.current = newCode;
    if (selectedProblemId) {
      updateCode({ problemId: selectedProblemId, code: newCode });
    }
    if (collaborationId) {
      console.log('[Student] emit collab:edit', {
        collaborationId,
        problemId: selectedProblemId,
        code: newCode,
      });
      socket.emit('collab:edit', { collaborationId, problemId: selectedProblemId, code: newCode });
    }
  };

  const handleCursorChange = (position: { lineNumber: number; column: number }) => {
    console.log('[Student] handleCursorChange', { collabId: collabIdRef.current, position });
    if (!collabIdRef.current) {
      console.warn('[Student] collaborationId 가 없어 emit 스킵');
      return;
    }
    console.log('[Student] cursor 위치 변경 → 서버로 emit', position);
    socket.emit('cursor:update', { collaborationId: collabIdRef.current, ...position });
  };

  const handleSubmit = () => {
    if (!roomId || !selectedProblemId) return;
    setAnalysisPanelOpen(true);
    submitCode(roomId, String(selectedProblemId), userCode);
  };

  const handleCloseAnalysis = () => {
    closeAnalysis();
    setAnalysisPanelOpen(false);
  };

  // 1. 수업 나가기 핸들러 추가
  const handleLeaveClass = () => {
    useStudentStore.getState().resetStore(); // 방 나갈 때 상태 초기화
    localStorage.removeItem('lastRoomId'); // 방 나갈 때 roomId도 삭제
    if (roomId && myId && inviteCode) {
      socket.emit('room:leave', { roomId, userId: myId, inviteCode });
      window.location.href = '/';
    } else {
      window.location.href = '/';
    }
  };
  // SVG 관련 핸들러 함수들 (학생은 읽기 전용)
  const handleAddSVGLine = (line: SVGLine) => {
    // 학생은 그림을 그릴 수 없음 (읽기 전용)
  };

  const handleClearSVGLines = () => {
    // 학생은 그림을 지울 수 없음 (읽기 전용)
  };

  const handleSetSVGLines = (lines: SVGLine[]) => {
    setSvgLines(lines);
  };

  if (isRoomLoading && !currentRoom) {
    return (
      <div className="h-screen bg-slate-900 flex flex-col items-center justify-center">
        {/* 스피너와 문구를 모두 삭제하여 배경색만 남김 */}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white">
      {roomError && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded shadow z-50">
          {roomError}
        </div>
      )}

      <Header
        classCode={inviteCode || '...'}
        isConnecting={isJoiningRoom}
        title={currentRoom?.title || '수업 제목'}
        isClassStarted={currentRoom?.status === 'IN_PROGRESS'}
        onLeave={handleLeaveClass}
        onVoiceChatToggle={() => setIsVoiceChatOpen(!isVoiceChatOpen)}
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
        userId={String(myId || '')}
      />
      <main className="flex flex-grow overflow-hidden">
        <ProblemPanel
          problems={problems}
          userCode={userCode}
          onSubmit={handleSubmit}
          selectedProblemId={selectedProblemId}
          onSelectProblem={handleSelectProblem}
        />
        {/* 에디터 영역 렌더링 조건 */}
        <div className="flex-grow flex-shrink min-w-0">
          {selectedProblemId == null ? (
            <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
              <div className="flex flex-col items-center">
                <svg
                  width="64"
                  height="64"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="text-blue-400 mb-4 animate-bounce"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <div className="text-2xl font-bold text-blue-300 mb-2 text-center">
                  문제를 선택해 주세요
                </div>
                <div className="text-base text-slate-400 text-center">
                  왼쪽에서 풀고 싶은 문제를 클릭하면
                  <br />
                  코드 에디터가 열립니다.
                </div>
              </div>
            </div>
          ) : (
            <EditorPanel
              code={userCode}
              onCodeChange={handleCodeChange}
              studentName={user?.name}
              disabled={isCollabLoading}
              otherCursor={otherCursor}
              onCursorChange={handleCursorChange}
              roomId={roomId}
              userId={String(myId || '')}
              role="student"
              svgLines={svgLines}
              onAddSVGLine={handleAddSVGLine}
              onClearSVGLines={handleClearSVGLines}
              onSetSVGLines={handleSetSVGLines}
            />
          )}
        </div>
        {isAnalysisPanelOpen && (
          <div className="flex-shrink-0">
            <AnalysisPanel onClose={handleCloseAnalysis} />
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentClassPage;
