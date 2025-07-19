import React, { useState } from 'react';
import logo from '../../assets/coconutlogo.png';
import microphoneIcon from '../../assets/microphone.svg';
import Swal from 'sweetalert2';

interface HeaderProps {
  classCode?: string;
  isConnecting?: boolean;
  title?: string;
  isClassStarted?: boolean;
  onLeave?: () => void; // 추가
  onVoiceChatToggle?: () => void; // 음성채팅 토글 함수 추가
}

export const Header: React.FC<HeaderProps> = ({
  classCode = '수업 암호',
  isConnecting = false,
  title,
  onLeave, // 추가
  onVoiceChatToggle, // 추가
}) => {
  // 복사 완료 상태 관리
  const [showCopied, setShowCopied] = useState(false);
  const handleConnect = () => {
    alert('세션 연결하기 버튼 클릭!');
  };

  // 기존 handleManage 삭제 또는 미사용

  const handleMicrophone = () => {
    if (onVoiceChatToggle) {
      onVoiceChatToggle();
    } else {
      alert('마이크 버튼 클릭!');
    }
  };

  const handleLeave = () => {
    Swal.fire({
      title: '수업을 나가시겠습니까?',
      text: '정말로 수업을 나가시겠습니까?',
      icon: 'warning',
      showCancelButton: true,
      background: '#1e293b',
      color: '#f1f5f9',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '나가기',
      cancelButtonText: '취소',
    }).then((result) => {
      if (result.isConfirmed && onLeave) {
        onLeave();
      }
    });
  };

  return (
    <header className="w-full h-16 bg-slate-900 text-white flex items-center justify-between px-6 border-b border-slate-700">
      {/* 왼쪽 섹션: 로고 및 수업 정보 */}
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
          {isConnecting && (
            <span className="ml-2 inline-flex items-center text-yellow-400">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-yellow-400 mr-1"></div>
              연결 중...
            </span>
          )}
        </div>
      </div>

      {/* 오른쪽 섹션: 아이콘 및 버튼 */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-slate-400">
          <button
            className="hover:text-white transition-colors"
            aria-label="Microphone"
            onClick={handleMicrophone}
          >
            <img src={microphoneIcon} alt="Microphone" className="h-6 w-6" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLeave}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            수업 나가기
          </button>
        </div>
      </div>
    </header>
  );
};
