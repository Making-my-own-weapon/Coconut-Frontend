import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../components/student-class/Header';
import ProblemPanel from '../components/student-class/ProblemPanel/ProblemPanel';
import EditorPanel from '../components/student-class/EditorPanel/EditorPanel';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';

/**
 * 소켓 연결 시도
 * 소켓은 한 번 만들고 재사용하기 위해 컴포넌트 밖에 선언
 */
const socket = io('http://localhost:3001');

export const StudentClassPage: React.FC = () => {
  const { editorId } = useParams();
  /* 다른 사용자의 편집 내용을 받은 경우 다시 emit하지 않음 */
  const isRemoteUpdate = useRef(false);
  /* 학생이 에디터에 작성하는 코드를 관리하는 상태 */
  const [userCode, setUserCode] = useState<string>('# 여기에 코드를 입력하세요');

  /**
   * 소켓 연결 후 editorId에 해당하는 에디터에 join
   *    - editorId값이 바뀔 때마다 useEffect 내부 코드를 다시 실행하여 사용자가 올바른 editorId에 참여하게 함
   *    - 클라이언트가 다른 에디터로 이동하면 editorId가 변경되고 새 에디터에 join하기 위해 useEffect를 다시 실행해야 함
   */
  useEffect(() => {
    const handleConnect = () => {
      socket.emit('joinEditor', { editorId: editorId });
    };

    socket.on('connect', handleConnect);

    return () => {
      socket.off('connect', handleConnect);
    };
  }, [socket, editorId]);

  /* 다른 사용자의 코드 변경 수신 */
  useEffect(() => {
    socket.on('editorUpdated', (payload) => {
      if (payload.editorId === editorId) {
        isRemoteUpdate.current = true;
        setUserCode(payload.code);
      }
    });

    return () => {
      socket.off('editorUpdated');
    };
  }, [socket, editorId]);

  /* 현재 사용자의 코드 변경 감지 및 전송 */
  const handleCodeChange = (code: string | undefined) => {
    /* setUserCode로 새 값을 저장하면 react가 자동으로 화면에 반영 */
    setUserCode(code ?? '');

    /* 변경된 코드를 같은 editorId를 가진 다른 사용자에게 전송 */
    if (!isRemoteUpdate.current) {
      socket.emit('editCode', {
        editorId: editorId,
        code: code,
      });
    }

    isRemoteUpdate.current = false;
  };

  function handleSubmit(): void {
    throw new Error('Function not implemented.');
  }

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white">
      <Header classCode="실시간 코딩 테스트" />
      <main className="flex flex-grow overflow-hidden">
        {/* 문제 패널 영역 (왼쪽) */}
        <ProblemPanel userCode={userCode} onSubmit={handleSubmit} />
        {/* Monaco Editor 영역 (오른쪽) */}
        <EditorPanel
          code={userCode}
          onCodeChange={(value: string | undefined) => {
            handleCodeChange(value);
            return {};
          }}
        />
      </main>
    </div>
  );
};

export default StudentClassPage;
