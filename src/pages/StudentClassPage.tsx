import React, { useState, useEffect, useRef } from 'react';
import { Header } from '../components/student-class/Header';
import ProblemPanel from '../components/student-class/ProblemPanel/ProblemPanel';
import EditorPanel from '../components/student-class/EditorPanel/EditorPanel';
import AnalysisPanel from '../components/student-class/AnalysisPanel';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';

/**
 * 소켓은 한 번 만들고 재사용하기 위해 컴포넌트 밖에 선언합니다.
 */
const socket = io('http://localhost:3001');

// 분석 패널을 위한 목업 데이터 정의
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
  // --- 상태 관리 (State) ---
  // 실시간 코드 공유 관련 상태
  const { editorId } = useParams();
  const isRemoteUpdate = useRef(false); // 다른 사용자의 편집 내용을 받은 경우 다시 emit하지 않도록 방지
  const [userCode, setUserCode] = useState<string>('# 여기에 코드를 입력하세요');

  // 분석 패널 관련 상태
  const [isAnalysisPanelOpen, setAnalysisPanelOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  // --- 소켓 통신 로직 (Side Effects) ---
  // 소켓 연결 시 에디터 'join'
  useEffect(() => {
    const handleConnect = () => {
      socket.emit('joinEditor', { editorId: editorId });
    };
    socket.on('connect', handleConnect);
    return () => {
      socket.off('connect', handleConnect);
    };
  }, [editorId]);

  // 다른 사용자의 코드 변경 수신
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
  }, [editorId]);

  // --- 이벤트 핸들러 ---
  // 현재 사용자의 코드 변경 감지 및 전송
  const handleCodeChange = (code: string | undefined) => {
    setUserCode(code ?? '');

    if (!isRemoteUpdate.current) {
      socket.emit('editCode', {
        editorId: editorId,
        code: code,
      });
    }
    isRemoteUpdate.current = false;
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

  // 분석 패널 닫기 핸들러
  const handlePanelClose = () => {
    setAnalysisPanelOpen(false);
  };

  // --- 렌더링 ---
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
