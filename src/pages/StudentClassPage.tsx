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
  // URL에서 roomId(숫자) 문자열로 추출
  const { roomId } = useParams<{ roomId: string }>();

  // 2. 각 스토어에서 필요한 상태와 액션을 가져옵니다.
  const { currentRoom, problems, isLoading: isRoomLoading, fetchRoomDetails } = useStudentStore();
  const { isSubmitting, analysisResult, submitCode, closeAnalysis } = useSubmissionStore();
  const { user } = useAuthStore();
  const myId = user?.id;
  const myName =
    currentRoom?.participants?.find((p) => p.userId === user.id)?.name || user.name || '';

  // 방 정보 fetch 후 inviteCode(문자열)도 별도 변수로 저장
  const inviteCode = currentRoom?.inviteCode;

  const [userCode, setUserCode] = useState<string>('# 여기에 코드를 입력하세요');
  const [collaborationId, setCollaborationId] = useState<string | null>(null);
  const isRemoteUpdate = useRef(false);
  const currentCodeRef = useRef<string>('# 여기에 코드를 입력하세요'); // 현재 에디터 코드 참조

  const [roomError, setRoomError] = useState<string | null>(null);
  const [isCollabLoading, setIsCollabLoading] = useState(false);
  const [isJoiningRoom, setIsJoiningRoom] = useState(false);

  useEffect(() => {
    if (roomId) fetchRoomDetails(roomId);
  }, [roomId, fetchRoomDetails]);

  useEffect(() => {
    if (!user || !roomId || !inviteCode) return;
    const myId = user.id;
    const myName = user.name;
    setIsJoiningRoom(true);
    socket.connect();
    socket.emit('room:join', {
      roomId, // 내부 식별자 (문자열)
      inviteCode, // 외부 공유 코드 (문자열)
      userId: myId,
      userName: myName,
      role: 'student',
    });

    // 입장 성공/실패 이벤트 리스너
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

    // 협업 시작 완료(collab:started)
    socket.on('collab:started', ({ collaborationId }) => {
      setCollaborationId(collaborationId);
      setIsCollabLoading(false);
    });
    // 협업 요청(code:request)
    socket.on('code:request', ({ collaborationId, teacherSocketId }) => {
      console.log('code:request 수신!', { collaborationId, teacherSocketId });
      setIsCollabLoading(true);
      // 현재 에디터에 표시된 실제 코드를 전송
      socket.emit('code:send', { collaborationId, code: currentCodeRef.current });
    });
    // 코드 동기화(code:update)
    socket.on('code:update', ({ code }) => {
      setUserCode(code);
      currentCodeRef.current = code; // 원격 업데이트 시에도 참조 업데이트
    });
    // 협업 종료(collab:ended)
    socket.on('collab:ended', () => {
      setCollaborationId(null);
    });

    // cleanup
    return () => {
      socket.off('room:joined');
      socket.off('room:full');
      socket.off('room:notfound');
      socket.off('collab:started');
      socket.off('code:update');
      socket.off('collab:ended');
    };
  }, [user, roomId, inviteCode, fetchRoomDetails]);

  // (타이머 관련 상태, useEffect, props 모두 삭제)

  const handleCodeChange = (code: string | undefined) => {
    const newCode = code || '';
    setUserCode(newCode);
    currentCodeRef.current = newCode; // 현재 코드 참조 업데이트
    if (collaborationId) {
      socket.emit('collab:edit', { collaborationId, code: newCode });
    }
    isRemoteUpdate.current = false;
  };

  // 3. 제출 핸들러가 submissionStore의 액션을 호출하도록 수정합니다.
  const handleSubmit = () => {
    // 현재 선택된 문제 ID를 가져오는 로직이 필요합니다.
    // 여기서는 첫 번째 문제를 제출하는 것으로 가정합니다.
    const currentProblemId = problems[0]?.problemId;
    if (!roomId || !currentProblemId) return;

    submitCode(roomId, currentProblemId, userCode);
  };

  // 방 정보가 없고 로딩 중일 때만 최소한의 로딩 표시
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

  console.log('페이지 렌더링, currentRoom 상태:', currentRoom);

  // 메인 렌더링
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
        <ProblemPanel problems={problems} userCode={userCode} onSubmit={handleSubmit} />
        <div className="flex-grow flex-shrink min-w-0">
          <EditorPanel
            code={userCode}
            onCodeChange={handleCodeChange}
            studentName={myName}
            disabled={isCollabLoading}
          />
        </div>

        {/* 분석 패널 (너비 고정, 조건부 렌더링) */}
        {(isSubmitting || analysisResult) && (
          <div className="flex-shrink-0">
            <AnalysisPanel
              isLoading={isSubmitting}
              result={analysisResult}
              onClose={closeAnalysis}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentClassPage;
