//src/components/commoc/HeaderLogout.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from './logoutApi';

const HeaderLogout: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) return;
    try {
      await logout(accessToken);
    } catch (e) {
      // 에러 무시 (네트워크 등)
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  return (
    <header className="w-full h-[70px] flex-shrink-0 fixed top-0 left-0 z-50 bg-white/80 border-b shadow-sm backdrop-blur-sm">
      <div className="relative z-10 w-full h-full flex items-center justify-between px-4 md:px-8 lg:px-[122px]">
        {/* Logo */}
        <img
          className="w-[226px] h-[70px] flex-shrink-0 aspect-[226/70]"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/7a72c507f2b4d8434977a4daa7a9a90fe135d258?width=452"
          alt="코코넛 로고"
        />

        {/* Logout button */}
        <button
          className="w-[125px] h-[40px] flex-shrink-0 rounded-md bg-red-500 shadow-lg flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
          onClick={handleLogout}
        >
          {/* Logout icon */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 25 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6 flex-shrink-0"
          >
            <path
              d="M16.2363 17L21.2363 12M21.2363 12L16.2363 7M21.2363 12H9.23633M9.23633 21H5.23633C4.7059 21 4.19719 20.7893 3.82211 20.4142C3.44704 20.0391 3.23633 19.5304 3.23633 19V5C3.23633 4.46957 3.44704 3.96086 3.82211 3.58579C4.19719 3.21071 4.7059 3 5.23633 3H9.23633"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Logout text */}
          <span className="text-white text-center font-inter text-sm font-medium leading-5">
            로그아웃
          </span>
        </button>
      </div>
    </header>
  );
};

export default HeaderLogout;
