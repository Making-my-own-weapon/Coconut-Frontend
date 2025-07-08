import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import Dropdown from './Dropdown';
import IconUser from '../../assets/icons/IconUser';

// 1. props 타입을 정의합니다.
interface HeaderProps {
  hideButtons?: boolean;
}

const Header: React.FC<HeaderProps> = ({ hideButtons = false }) => {
  // 2. props를 받습니다.
  const { isLoggedIn, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 z-50 w-full h-[70px] flex-shrink-0">
      <div className="w-full h-full border-b border-gray-200 bg-white/80 shadow-sm backdrop-blur-sm absolute left-0 top-0" />

      <div className="relative z-10 w-full h-full flex items-center justify-between px-4 sm:px-8 lg:px-[122px]">
        <Link to={isLoggedIn ? '/join' : '/'}>
          <img
            className="w-auto h-[50px] sm:h-[60px] flex-shrink-0"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/df3b83db1779f3ab8c05c0311fa0ed2b93f79b54?width=451"
            alt="Coconut Logo"
          />
        </Link>

        {/* 3. hideButtons가 false일 때만 이 부분을 렌더링합니다. */}
        {!hideButtons && (
          <div>
            {isLoggedIn ? (
              <Dropdown trigger={<IconUser className="w-10 h-10" />}>
                <Link
                  to="/mypage"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  마이페이지
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  로그아웃
                </button>
              </Dropdown>
            ) : (
              <Link to="/login">
                <button className="px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
                  로그인
                </button>
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
