//src/components/teacher-class/Header.tsx
import React, { useEffect, useRef, useState } from 'react';
import logo from '../../assets/coconutlogo.png';
import microphoneIcon from '../../assets/microphone.svg';
import settingsIcon from '../../assets/settings.svg';

interface TeacherHeaderProps {
  classCode?: string;
  mode: 'grid' | 'editor';
  onModeChange: (mode: 'grid' | 'editor') => void;
  isClassStarted: boolean;
  onToggleClass: (currentTimer?: string) => void;
  title?: string; // 수업 제목만 남김
  onVoiceChatToggle?: () => void; // 음성채팅 토글 함수 추가
}

const TeacherHeader: React.FC<TeacherHeaderProps> = ({
  classCode,
  mode,
  onModeChange,
  isClassStarted,
  onToggleClass,
  title,
  onVoiceChatToggle, // 추가
}) => {
  // 마이크/설정 버튼 핸들러 (학생과 동일)
  const handleMicrophone = () => {
    if (onVoiceChatToggle) {
      onVoiceChatToggle();
    } else {
      alert('마이크 버튼 클릭!');
    }
  };
  const handleSettings = () => {
    alert('설정 버튼 클릭! (나중에 로직 추가)');
  };

  // 타이머 상태 및 관리
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevClassStarted = useRef(isClassStarted);

  // 타이머 포맷 함수
  const formatTime = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  useEffect(() => {
    // 수업 시작 시 타이머 시작
    if (isClassStarted && !prevClassStarted.current) {
      intervalRef.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 1000);
    }
    // 수업 종료 시 타이머 정지 및 초기화
    if (!isClassStarted && prevClassStarted.current) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setTimer(0);
    }
    prevClassStarted.current = isClassStarted;
    // 언마운트 시 클린업
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isClassStarted]);

  return (
    <header className="w-full h-16 bg-slate-900 text-white flex items-center justify-between px-6 border-b border-slate-700">
      {/* 왼쪽: 로고, 수업코드 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Coconut Logo" className="h-[170px] w-auto" />
        </div>
        <div className="h-6 w-px bg-slate-600" aria-hidden="true" />
        <span className="text-lg font-bold text-white">{title}</span>
        <div className="h-6 w-px bg-slate-600" aria-hidden="true" />
        <span className="text-sm text-slate-400">수업 코드: {classCode}</span>
      </div>
      {/* 오른쪽: 아이콘 + 버튼 */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-slate-400">
          {/* 타이머 표시 */}
          <span className="font-mono text-base text-white min-w-[90px] text-center select-none">
            {formatTime(timer)}
          </span>
          <button
            className="hover:text-white transition-colors"
            aria-label="Microphone"
            onClick={handleMicrophone}
          >
            <img src={microphoneIcon} alt="Microphone" className="h-6 w-6" />
          </button>
          <button
            className="hover:text-white transition-colors"
            aria-label="Settings"
            onClick={handleSettings}
          >
            <img src={settingsIcon} alt="Settings" className="h-6 w-6" />
          </button>
        </div>
        {/* 그리드/에디터 전환 버튼 */}
        <button
          onClick={() => onModeChange(mode === 'grid' ? 'editor' : 'grid')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
        >
          {mode === 'grid' ? '내 코드 보기' : '그리드 보기'}
        </button>
        {/* 수업 시작/종료 버튼 */}
        <button
          onClick={() => onToggleClass(formatTime(timer))}
          className={`px-4 py-2 ${isClassStarted ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${isClassStarted ? 'focus:ring-red-500' : 'focus:ring-green-500'}`}
        >
          {isClassStarted ? '수업 종료' : '수업 시작'}
        </button>
      </div>
    </header>
  );
};

export default TeacherHeader;
