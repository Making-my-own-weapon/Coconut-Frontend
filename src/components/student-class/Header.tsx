// 필요한 모듈과 파일을 불러오기
import React from 'react';
import logo from '../../assets/coconutlogo.png';
import microphoneIcon from '../../assets/microphone.svg';
import settingsIcon from '../../assets/settings.svg';

// props 상속 받기
/* 부모의 전달은 <Header classCode={myClassCode} /> 와 같이 사용할 수 있음 */
interface HeaderProps {
  classCode?: string;
}

// 함수형 컴포넌트 정의 (header 컴포넌트) FC : React Function Component
// export const Header: export 키워드를 사용해 이 Header 컴포넌트를 다른 파일에서 import하여 재사용할 수 있도록 정의
// React.FC<HeaderProps> 타입 정의: 이 컴포넌트는 HeaderProps 타입의 props를 받을 수 있음
// 기본값 설정: classCode 프로퍼티가 전달되지 않으면 '수업 암호'로 설정됨
export const Header: React.FC<HeaderProps> = ({ classCode = '수업 암호' }) => {
  // 이벤트 처리 헨들러

  // 버튼 클릭 이벤트를 처리하는 예시 핸들러입니다.
  const handleConnect = () => {
    alert('세션 연결하기 버튼 클릭!');
  };

  const handleManage = () => {
    alert('수업 관리 버튼 클릭!');
  };

  // 마이크 버튼 클릭 핸들러 (나중에 로직 추가)
  const handleMicrophone = () => {
    alert('마이크 버튼 클릭! (나중에 로직 추가)');
  };

  // 설정 버튼 클릭 핸들러 (나중에 로직 추가)
  const handleSettings = () => {
    alert('설정 버튼 클릭! (나중에 로직 추가)');
  };

  //JSX (JavaScript XML) Html 코드를 JS 코드로 작성할 수 있도록 해주는 것. Js에서 UI 구조를 작성할 수 있도록 해줌.
  return (
    <header className="w-full h-16 bg-slate-900 text-white flex items-center justify-between px-6 border-b border-slate-700">
      {/* 왼쪽 섹션: 로고 및 수업 정보 */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Coconut Logo" className="h-[170px] w-auto" />
        </div>
        <div className="h-6 w-px bg-slate-600" aria-hidden="true" />
        <span className="text-sm text-slate-400">수업 코드: {classCode}</span>
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
            onClick={handleManage}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            수업 도망가기
          </button>
        </div>
      </div>
    </header>
  );
};
