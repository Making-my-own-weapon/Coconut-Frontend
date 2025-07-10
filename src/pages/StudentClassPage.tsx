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

      return () => {
        socket.off('room:joined');
        socket.off('room:full');
        socket.off('room:notfound');
        socket.off('collab:started');
        socket.off('code:update');
        socket.off('collab:ended');
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
