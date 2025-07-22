//src/components/teacher-class/Header.tsx
import React, { useEffect, useRef, useState } from 'react';
import logo from '../../assets/coconutlogo.png';
import microphoneIcon from '../../assets/microphone.svg';
// import { showConfirm } from '../../utils/sweetAlert'; // 제거

interface TeacherHeaderProps {
  classCode?: string;
  mode: 'grid' | 'editor';
  onModeChange: (mode: 'grid' | 'editor') => void;
  isClassStarted: boolean;
  onToggleClass: (currentTimer?: string) => void;
  title?: string; // 수업 제목만 남김
  onVoiceChatToggle?: () => void; // 음성채팅 토글 함수 추가
  roomId?: string; // 방 ID 추가
}

const TeacherHeader: React.FC<TeacherHeaderProps> = ({
  classCode,
  mode,
  onModeChange,
  isClassStarted,
  onToggleClass,
  title,
  onVoiceChatToggle, // 추가
  roomId, // 추가
}) => {
  // 마이크/설정 버튼 핸들러 (학생과 동일)
  const handleMicrophone = () => {
    if (onVoiceChatToggle) {
      onVoiceChatToggle();
    }
  };

  const handleToggleClass = async () => {
    // 바로 실행 (확인창 없이)
    onToggleClass(formatTime(timer));
  };

  // LocalStorage 기반 타이머 상태 및 관리
  const [timer, setTimer] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const prevClassStarted = useRef(isClassStarted);

  // 복사 완료 상태 관리
  const [showCopied, setShowCopied] = useState(false);

  // 타이머 포맷 함수
  const formatTime = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  // LocalStorage에서 타이머 정보 가져오기
  const getTimerFromStorage = () => {
    if (!roomId || !isClassStarted) return 0;

    const storageKey = `class_timer_${roomId}`;
    const startTime = localStorage.getItem(storageKey);

    if (startTime) {
      const elapsed = Math.floor((Date.now() - parseInt(startTime)) / 1000);
      return Math.max(0, elapsed);
    }
    return 0;
  };

  // LocalStorage에 시작 시간 저장
  const saveStartTimeToStorage = () => {
    if (!roomId) return;

    const storageKey = `class_timer_${roomId}`;
    localStorage.setItem(storageKey, Date.now().toString());
  };

  useEffect(() => {
    // 수업 시작 시 LocalStorage에서 타이머 정보 가져오기
    if (isClassStarted && !prevClassStarted.current) {
      const elapsedTime = getTimerFromStorage();
      if (elapsedTime === 0) {
        // 처음 시작하는 경우 시작 시간 저장
        saveStartTimeToStorage();
      }
      setTimer(elapsedTime);
      // 그 후 1초마다 증가
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
      // LocalStorage에서 시작 시간 제거
      if (roomId) {
        localStorage.removeItem(`class_timer_${roomId}`);
      }
    }
    prevClassStarted.current = isClassStarted;
    // 언마운트 시 클린업
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isClassStarted, roomId]);

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
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">수업 코드: {classCode}</span>
          <button
            onClick={() => {
              if (classCode) {
                navigator.clipboard
                  .writeText(classCode)
                  .then(() => {
                    setShowCopied(true);
                    setTimeout(() => setShowCopied(false), 2000);
                  })
                  .catch(() => {
                    // 복사 실패 시 조용히 처리
                    console.error('복사에 실패했습니다.');
                  });
              }
            }}
            className="p-1 hover:bg-slate-700 rounded transition-colors relative"
            aria-label="수업 코드 복사"
            title="수업 코드 복사"
          >
            <svg
              className="w-4 h-4 text-slate-400 hover:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            {showCopied && (
              <span className="absolute -top-1 left-full ml-2 bg-green-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap animate-fade-in">
                복사 완료
              </span>
            )}
          </button>
        </div>
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
          onClick={handleToggleClass}
          className={`px-4 py-2 ${isClassStarted ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${isClassStarted ? 'focus:ring-red-500' : 'focus:ring-green-500'}`}
        >
          {isClassStarted ? '수업 종료' : '수업 시작'}
        </button>
      </div>
    </header>
  );
};

export default TeacherHeader;
