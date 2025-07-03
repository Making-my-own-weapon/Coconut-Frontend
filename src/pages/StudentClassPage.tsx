import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useStudentStore } from '../store/studentStore';
import { useSubmissionStore } from '../store/submissionStore';
import { Header } from '../components/student-class/Header';
import ProblemPanel from '../components/student-class/ProblemPanel/ProblemPanel';
import EditorPanel from '../components/student-class/EditorPanel/EditorPanel';
import AnalysisPanel from '../components/student-class/AnalysisPanel';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

const StudentClassPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();

  // 2. 각 스토어에서 필요한 상태와 액션을 가져옵니다.
  const { currentRoom, problems, isLoading: isRoomLoading, fetchRoomDetails } = useStudentStore();
  const { isSubmitting, analysisResult, submitCode, closeAnalysis } = useSubmissionStore();

  const [userCode, setUserCode] = useState<string>('# 여기에 코드를 입력하세요');
  const isRemoteUpdate = useRef(false);

  useEffect(() => {
    if (roomId) fetchRoomDetails(roomId);
  }, [roomId, fetchRoomDetails]);

  useEffect(() => {
    const handleConnect = () => socket.emit('joinEditor', { editorId: roomId });
    socket.on('connect', handleConnect);

    socket.on('editorUpdated', (payload) => {
      if (payload.editorId === roomId) {
        isRemoteUpdate.current = true;
        setUserCode(payload.code);
      }
    });

    return () => {
      socket.off('connect', handleConnect);
      socket.off('editorUpdated');
    };
  }, [roomId]);

  const handleCodeChange = (code: string | undefined) => {
    const newCode = code || '';
    setUserCode(newCode);
    if (!isRemoteUpdate.current) {
      socket.emit('editCode', { editorId: roomId, code: newCode });
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

  if (isRoomLoading) {
    return (
      <div className="h-screen bg-slate-900 text-white flex items-center justify-center">
        Loading class...
      </div>
    );
  }

  console.log('페이지 렌더링, currentRoom 상태:', currentRoom);

  // 메인 렌더링
  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white">
      <Header classCode={currentRoom?.inviteCode || '...'} />
      <main className="flex flex-grow overflow-hidden">
        <ProblemPanel problems={problems} userCode={userCode} onSubmit={handleSubmit} />
        <div className="flex-grow flex-shrink min-w-0">
          <EditorPanel code={userCode} onCodeChange={handleCodeChange} />
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
