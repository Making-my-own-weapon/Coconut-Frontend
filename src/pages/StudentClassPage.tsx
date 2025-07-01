import React, { useState } from 'react';
import { Header } from '../components/student-class/Header';
import ProblemPanel from '../components/student-class/ProblemPanel/ProblemPanel';
import EditorPanel from '../components/student-class/EditorPanel/EditorPanel';
import AnalysisPanel from '../components/student-class/AnalysisPanel';

// 목업 데이터 정의
const mockResult = {
  progress: {
    percentage: 75,
    tests: '3/4',
    time: '0.8s',
  },
  aiSuggestions: [
    {
      type: 'performance' as const,
      title: '중첩 루프로 인한 성능 이슈 - Set 또는 HashMap 사용 권장',
      line: 4,
    },
    {
      type: 'optimization' as const,
      title: 'ES6 filter/includes 메서드 활용으로 코드 간소화 가능',
    },
    { type: 'best-practice' as const, title: '변수명과 로직 구조가 명확합니다' },
  ],
  execution: {
    problemTitle: '2257 Hello World',
    time: '125ms',
    memory: '13.4MB',
    status: 'success' as const,
  },
  complexity: {
    time: 'O(n²)',
    space: 'O(n)',
    cyclomatic: 3,
    loc: 12,
  },
  quality: {
    efficiency: 65,
    readability: 80,
  },
  performanceImprovements: [
    'Set 자료구조 활용으로 O(n) 달성',
    'ES6 메서드로 코드 간소화',
    '엣지 케이스 처리 추가',
  ],
};

export const StudentClassPage: React.FC = () => {
  // 학생이 에디터에 작성하는 코드를 관리하는 상태
  const [userCode, setUserCode] = useState<string>('def solution(a, b):\n  return a + b');
  const [isAnalysisPanelOpen, setAnalysisPanelOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  // 코드 변경 핸들러
  const handleCodeChange = (code: string | undefined) => {
    setUserCode(code || '');
  };

  // 제출 및 분석 핸들러
  const handleSubmit = () => {
    console.log('분석 시작. 제출된 코드:', userCode);
    setAnalysisPanelOpen(true);
    setIsAnalyzing(true);
    setAnalysisResult(null);

    // 실제로는 여기서 서버로 코드를 보내고 결과를 받아야 합니다.
    // 지금은 2초 뒤에 목업 데이터를 표시하는 것으로 대체합니다.
    setTimeout(() => {
      setAnalysisResult(mockResult);
      setIsAnalyzing(false);
      console.log('분석 완료');
    }, 2000);
  };

  const handlePanelClose = () => {
    setAnalysisPanelOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white">
      <Header classCode="실시간 코딩 테스트" />
      <main className="flex flex-grow overflow-hidden">
        {/* 문제 패널 (너비 고정) */}
        <div className="flex-shrink-0">
          <ProblemPanel userCode={userCode} onSubmit={handleSubmit} />
        </div>

        {/* Monaco Editor 영역 (가변 너비) */}
        <div className="flex-grow flex-shrink min-w-0">
          <EditorPanel code={userCode} onCodeChange={handleCodeChange} />
        </div>

        {/* 분석 패널 (너비 고정, 조건부 렌더링) */}
        {isAnalysisPanelOpen && (
          <div className="flex-shrink-0">
            <AnalysisPanel
              isLoading={isAnalyzing}
              result={analysisResult}
              onClose={handlePanelClose}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentClassPage;
