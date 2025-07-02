import React, { useState } from 'react';
import { Header } from '../components/student-class/Header';
import ProblemPanel from '../components/student-class/ProblemPanel/ProblemPanel';
import EditorPanel from '../components/student-class/EditorPanel/EditorPanel';
import { useParams } from 'react-router-dom';

export const StudentClassPage: React.FC = () => {
  // 학생이 에디터에 작성하는 코드를 관리하는 상태
  const [userCode, setUserCode] = useState<string>('# 여기에 코드를 입력하세요');
  const { roomId } = useParams();

  // 코드 변경 핸들러
  const handleCodeChange = (code: string | undefined) => {
    setUserCode(code || '');
  };

  // 제출 핸들러 (임시)
  const handleSubmit = () => {
    console.log('제출된 코드:', userCode);
    alert('코드가 제출되었습니다! (콘솔 확인)');
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white">
      <Header classCode="실시간 코딩 테스트" />
      <main className="flex flex-grow overflow-hidden">
        {/* 문제 패널 영역 (왼쪽) */}
        <ProblemPanel userCode={userCode} onSubmit={handleSubmit} />
        {/* Monaco Editor 영역 (오른쪽) */}
        <EditorPanel code={userCode} onCodeChange={handleCodeChange} />
      </main>
    </div>
  );
};

export default StudentClassPage;
