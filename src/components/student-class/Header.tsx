import React from 'react';
import logo from '../../assets/coconutlogo.png';
import microphoneIcon from '../../assets/microphone.svg';
import settingsIcon from '../../assets/settings.svg';

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

  const handleSettings = () => {
    alert('설정 버튼 클릭! (나중에 로직 추가)');
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
        <span className="text-sm text-slate-400">
          수업 코드: {classCode}
          {isConnecting && (
            <span className="ml-2 inline-flex items-center text-yellow-400">
              <div className="animate-spin rounded-full h-3 w-3 border-b border-yellow-400 mr-1"></div>
              연결 중...
            </span>
          )}
        </span>
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
          <button
            className="hover:text-white transition-colors"
            aria-label="Settings"
            onClick={handleSettings}
          >
            <img src={settingsIcon} alt="Settings" className="h-6 w-6" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleConnect}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            선생님 호출하기
          </button>
          <button
            onClick={onLeave} // 여기!
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            수업 나가기
          </button>
        </div>
      </div>
    </header>
  );
};
