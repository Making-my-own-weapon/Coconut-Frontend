//src/components/login/LoginCard.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth/authStore'; // 1. Zustand 스토어를 가져옵니다.

// LoginCard 컴포넌트 이름은 기존 파일에 맞춰주세요.
const LoginCard: React.FC = () => {
  // 2. 컴포넌트 내부의 상태는 이제 UI 상호작용만을 위해 사용됩니다.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 3. Zustand 스토어에서 'login' 액션 함수만 가져옵니다.
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate(); // 4. 로그인 성공 후 페이지 이동을 위한 훅

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // 5. 스토어에 정의된 login 액션을 호출합니다.
      await login(email, password);
      // 로그인 성공 시, JoinPage로 이동합니다.
      navigate('/join');
    } catch (err) {
      // 스토어의 login 액션에서 발생한 에러를 처리합니다.
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // JSX 부분은 기존 코드를 거의 그대로 사용합니다.
  // form의 onSubmit, input의 value와 onChange만 확인해주세요.
  return (
    <div className="relative w-full min-h-screen flex items-center justify-center px-4 py-8">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white rounded-lg border border-gray-200 shadow-[0px_8px_10px_0px_rgba(0,0,0,0.10),0px_20px_25px_0px_rgba(0,0,0,0.10)] flex flex-col items-center py-8 px-6"
      >
        {/* ... (아이콘 및 제목 부분은 동일) ... */}
        <h1 className="text-gray-900 font-inter text-2xl font-bold leading-8 tracking-[-0.6px] whitespace-nowrap truncate mb-1">
          로그인
        </h1>
        <p className="text-gray-600 font-inter text-base font-normal leading-6 whitespace-nowrap truncate mb-6">
          계정에 로그인하여 Coconut을 시작하세요
        </p>

        {/* Email Input */}
        <div className="w-full mb-4">
          <label className="block text-gray-700 font-inter text-sm font-medium leading-[14px] mb-[13px]">
            이메일
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="name@example.com"
            required
          />
        </div>

        {/* Password Input */}
        <div className="w-full mb-4">
          <label className="block text-gray-700 font-inter text-sm font-medium leading-[14px] mb-[13px]">
            비밀번호
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            placeholder="비밀번호를 입력하세요"
            required
          />
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 rounded-md bg-blue-600 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.10),0px_10px_15px_0px_rgba(0,0,0,0.10)] hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
        >
          <span className="text-white font-inter text-sm font-normal leading-5">
            {loading ? '로그인 중...' : '로그인'}
          </span>
        </button>

        {/* Error Message */}
        {error && <div className="mt-2 mb-2 text-red-500 text-sm text-center w-full">{error}</div>}

        {/* Divider and Sign Up Link */}
        <div className="w-full h-px bg-gray-200 my-4" />
        <div className="flex items-center justify-center space-x-1 w-full">
          <span className="text-gray-600 font-inter text-sm font-normal leading-5 whitespace-nowrap truncate">
            계정이 없으신가요?
          </span>
          <Link
            to="/signup"
            className="text-blue-600 font-inter text-sm font-medium leading-5 hover:text-blue-700 transition-colors whitespace-nowrap truncate"
          >
            회원가입
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginCard;
