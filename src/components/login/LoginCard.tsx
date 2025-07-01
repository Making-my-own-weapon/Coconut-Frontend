import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { login } from './loginApi';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      // TODO: 로그인 성공 후 페이지 이동 등 추가 처리
      setLoading(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('로그인 중 오류가 발생했습니다.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen flex items-center justify-center px-4 py-8">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white rounded-lg border border-gray-200 shadow-[0px_8px_10px_0px_rgba(0,0,0,0.10),0px_20px_25px_0px_rgba(0,0,0,0.10)] flex flex-col items-center py-8 px-6"
      >
        {/* Login Icon */}
        <div className="w-14 h-14 mb-4 relative">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 shadow-[0px_4px_6px_0px_rgba(0,0,0,0.10),0px_10px_15px_0px_rgba(0,0,0,0.10)] absolute left-0 top-0" />
          <svg
            className="absolute left-4 top-4 w-6 h-6"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 17L15 12L10 7"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 12H3"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {/* Login Title */}
        <h1 className="text-gray-900 font-inter text-2xl font-bold leading-8 tracking-[-0.6px] whitespace-nowrap truncate mb-1">
          로그인
        </h1>
        {/* Subtitle */}
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
          <svg
            className="w-6 h-6"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 17L15 12L10 7"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M15 12H3"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-white font-inter text-sm font-normal leading-5">
            {loading ? '로그인 중...' : '로그인'}
          </span>
        </button>
        {/* Error Message */}
        {error && (
          <div className="mt-2 mb-2 text-red-500 text-sm text-center w-full">
            {error}
          </div>
        )}
        {/* Divider */}
        <div className="w-full h-px bg-gray-200 mb-3" />
        {/* Sign Up Link */}
        <div className="flex items-center justify-center space-x-1 w-full">
          <span className="text-gray-600 font-inter text-sm font-normal leading-5 whitespace-nowrap truncate">
            계정이 없으신가요?
          </span>
          <Link to="/signup">
            <button className="text-blue-600 font-inter text-sm font-medium leading-5 hover:text-blue-700 transition-colors whitespace-nowrap truncate">
              회원가입
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default LoginPage;
