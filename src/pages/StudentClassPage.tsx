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
import socket from '../lib/socket';

interface SVGLine {
  points: [number, number][];
  color: string;
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

  const {
    currentRoom,
    problems,
    codes,
    selectedProblemId,
    isLoading: isRoomLoading,
    fetchRoomDetails,
    selectProblem,
    updateCode,
  } = useStudentStore();

  const { submitCode, closeAnalysis } = useSubmissionStore();
  const { user } = useAuthStore();
  const myId = user?.id;
  const myName =
    currentRoom?.participants?.find((p) => p.userId === user?.id)?.name || user?.name || '';
  const inviteCode = currentRoom?.inviteCode;

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

  const storeRef = useRef({ selectedProblemId, updateCode });
  useEffect(() => {
    storeRef.current = { selectedProblemId, updateCode };
  }, [selectedProblemId, updateCode]);

  const [roomError, setRoomError] = useState<string | null>(null);
  const [isCollabLoading, setIsCollabLoading] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);
  // SVG 상태 관리
  const [svgLines, setSvgLines] = useState<SVGLine[]>([]);

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
        setIsCollabLoading(false);
      });
      socket.on('code:request', ({ collaborationId, teacherSocketId }) => {
        setIsCollabLoading(true);
        socket.emit('code:send', { collaborationId, code: currentCodeRef.current });
      });
      socket.on('code:update', ({ code }) => {
        isRemoteUpdate.current = true;
        setUserCode(code);
        currentCodeRef.current = code;
        const currentProblemId = storeRef.current.selectedProblemId;
        if (currentProblemId) {
          storeRef.current.updateCode({ problemId: currentProblemId, code });
        }
      });
      socket.on('collab:ended', () => {
        setCollaborationId(null);
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
        socket.off('code:update');
        socket.off('collab:ended');
        socket.off('svgData');
        socket.off('svgCleared');
        socket.off('disconnect');
      };
    }
  }, [roomId, inviteCode, myId, myName]);

  const handleSelectProblem = (problemId: number | null) => {
    selectProblem(problemId);
  };

  const handleCodeChange = (code: string | undefined) => {
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
      socket.emit('collab:edit', { collaborationId, code: newCode });
    }
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
      />
      <main className="flex flex-grow overflow-hidden">
        <ProblemPanel
          problems={problems}
          userCode={userCode}
          onSubmit={handleSubmit}
          selectedProblemId={selectedProblemId}
          onSelectProblem={handleSelectProblem}
        />
        <div className="flex-grow flex-shrink min-w-0">
          <EditorPanel
            code={userCode}
            onCodeChange={handleCodeChange}
            studentName={myName}
            disabled={isCollabLoading}
            roomId={roomId}
            userId={user?.id ? String(user.id) : undefined}
            role="student"
            svgLines={svgLines}
            onAddSVGLine={handleAddSVGLine}
            onClearSVGLines={handleClearSVGLines}
            onSetSVGLines={handleSetSVGLines}
          />
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
