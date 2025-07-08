import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useStudentStore } from '../store/studentStore';
import { useSubmissionStore } from '../store/submissionStore';
import { useAuthStore } from '../store/authStore';
import { Header } from '../components/student-class/Header';
import ProblemPanel from '../components/student-class/ProblemPanel/ProblemPanel';
import EditorPanel from '../components/student-class/EditorPanel/EditorPanel';
import AnalysisPanel from '../components/student-class/AnalysisPanel';
import socket from '../lib/socket';

const StudentClassPage: React.FC = () => {
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

  const { isSubmitting, analysisResult, submitCode, closeAnalysis } = useSubmissionStore();
  const { user } = useAuthStore();
  const myId = user?.id;
  
  // dev 브랜치의 안정적인 이름, 초대코드 가져오기 로직 사용
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
  }, [selectedProblemId, codes]);

  // feat/submission/js 브랜치의 storeRef 로직 사용 (useEffect 클로저 문제 방지)
  const storeRef = useRef({ selectedProblemId, updateCode });
  useEffect(() => {
    storeRef.current = { selectedProblemId, updateCode };
  }, [selectedProblemId, updateCode]);

  const [roomError, setRoomError] = useState<string | null>(null);
  const [isCollabLoading, setIsCollabLoading] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);

  useEffect(() => {
    // feat/submission/js 브랜치의 전체 소켓 로직을 사용 (상태 저장 기능 포함)
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
        console.log('입장 성공', data);
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
        console.log('code:request 수신!', { collaborationId, teacherSocketId });
        setIsCollabLoading(true);
        socket.emit('code:send', { collaborationId, code: currentCodeRef.current });
      });
      socket.on('code:update', ({ code }) => {
        isRemoteUpdate.current = true;
        setUserCode(code);
        currentCodeRef.current = code;

        // 중앙 저장소에 업데이트하는 핵심 로직
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
        socket.off('code:request'); // code:request 리스너도 정리
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
    // isRemoteUpdate.current를 사용하여 무한 루프 방지
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

  if (isRoomLoading && !currentRoom) {
    return (
      <div className="h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>수업 정보를 불러오는 중...</p>
        </div>
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
        isClassStarted={currentRoom?.status === 'STARTED'}
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
