import React, { useState } from 'react';
import TeacherHeader from '../components/teacher-class/Header';
import TeacherProblemPanel from '../components/teacher-class/ProblemPanel/TeacherProblemPanel';
import TeacherEditorPanel from '../components/teacher-class/EditorPanel/EditorPanel';
import TeacherAnalysisPanel from '../components/teacher-class/AnalysisPanel';
import StudentGridView from '../components/teacher-class/grid/StudentGridView';
// import TeacherAnalysisPanel from '../components/teacher-class/AnalysisPanel';

const TeacherClassPage: React.FC = () => {
  const [userCode, setUserCode] = useState<string>('# 여기에 코드를 입력하세요');
  const [mode, setMode] = useState<'grid' | 'editor'>('grid');
  const [isClassStarted, setIsClassStarted] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // 코드 변경 핸들러
  const handleCodeChange = (code: string | undefined) => {
    setUserCode(code || '');
  };

  // 제출 핸들러 (임시)
  const handleSubmit = () => {
    console.log('제출된 코드:', userCode);
    alert('코드가 제출되었습니다! (콘솔 확인)');
  };

  // 수업 시작/종료 토글
  const handleToggleClass = () => {
    setIsClassStarted((prev) => !prev);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white">
      <TeacherHeader
        classCode="실시간 코딩 테스트"
        mode={mode}
        onModeChange={setMode}
        isClassStarted={isClassStarted}
        onToggleClass={handleToggleClass}
      />
      <main className="flex flex-grow overflow-hidden">
        <TeacherProblemPanel userCode={userCode} onSubmit={handleSubmit} />
        <div className="flex flex-grow">
          {mode === 'grid' ? (
            <StudentGridView />
          ) : analysisOpen ? (
            <>
              <div className="flex-grow">
                <TeacherEditorPanel code={userCode} onCodeChange={handleCodeChange} />
              </div>
              <TeacherAnalysisPanel
                isLoading={analysisLoading}
                result={analysisResult}
                onClose={() => {}}
              />
            </>
          ) : (
            <div className="flex-grow">
              <TeacherEditorPanel code={userCode} onCodeChange={handleCodeChange} />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TeacherClassPage;
