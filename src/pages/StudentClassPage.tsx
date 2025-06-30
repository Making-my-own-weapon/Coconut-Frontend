import React, { useState } from 'react';
import { Header } from '../components/student-class/Header';
import { ProblemPanel } from '../components/student-class/ProblemPanel/ProblemPanel';

export const StudentClassPage: React.FC = () => {
  const [userCode, _setUserCode] = useState<string>(
    `a, b = map(int, input().split())\nprint(a + b)`,
  );

  const handleGradeSubmit = async () => {
    alert('코드 제출! (임시 핸들러)');
  };

  return (
    <div className="w-screen h-screen bg-slate-900 flex flex-col text-gray-200">
      <Header />
      <main className="flex flex-grow overflow-hidden">
        <ProblemPanel userCode={userCode} onSubmit={handleGradeSubmit} />
      </main>
    </div>
  );
};
export default StudentClassPage;
