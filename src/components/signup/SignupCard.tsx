import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// 이 부분은 그대로 둡니다.
interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const MyNewComponent: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    console.log('Form submitted:', formData);
  };
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // --- 여기서부터가 완전히 새로 짜여진 레이아웃입니다 ---
  return (
    // 전체 페이지를 감싸고, 카드를 중앙 정렬하는 역할
    <div className="min-h-screen w-full bg-gradient-to-r from-blue-50 to-gray-50 flex items-center justify-center p-4 overflow-auto max-h-screen pt-16">
      {/* Signup Card: 이 카드가 세로 방향 Flexbox 컨테이너가 됩니다. */}
      <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 shadow-xl flex flex-col items-center p-6 sm:p-8">
        {/* Icon */}
        <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Header Text */}
        <div className="text-center mt-4 mb-8">
          <h1 className="text-gray-900 text-2xl font-bold tracking-tight">
            회원가입
          </h1>
          <p className="text-gray-600 text-base mt-1">
            새 계정을 만들어 Coconut을 시작하세요
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full">
          {/* Error Message */}
          {error && (
            <div className="text-red-500 text-sm text-center mb-4">{error}</div>
          )}
          {/* Name Field */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              이름
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="이름을 입력하세요"
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              이메일
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="name@example.com"
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              비밀번호
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="비밀번호를 입력하세요"
                className="w-full h-10 px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  {/* ... eye icon ... */}
                </svg>
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              비밀번호 확인
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="비밀번호를 다시 입력하세요"
                className="w-full h-10 px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  {/* ... eye icon ... */}
                </svg>
              </button>
            </div>
          </div>

          {/* Divider Line */}
          <div className="w-full h-px bg-gray-200 my-4" />

          {/* Submit Button (회원가입 버튼) */}
          <button
            type="submit"
            className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-md flex items-center justify-center gap-2 transition-colors duration-200 shadow-lg"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 20.748V18.5538C15 17.3899 14.5786 16.2736 13.8284 15.4506C13.0783 14.6276 12.0609 14.1653 11 14.1653H5C3.93913 14.1653 2.92172 14.6276 2.17157 15.4506C1.42143 16.2736 1 17.3899 1 18.5538V20.748"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M8 9.77693C10.2091 9.77693 12 7.81215 12 5.38847C12 2.96478 10.2091 1 8 1C5.79086 1 4 2.96478 4 5.38847C4 7.81215 5.79086 9.77693 8 9.77693Z"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M18 6.4856V13.0683"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M21 9.77686H15"
                stroke="white"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            회원가입
          </button>

          {/* Footer (로그인 링크) */}
          <div className="text-center mt-4">
            <span className="text-gray-600 text-sm font-normal">
              이미 계정이 있으신가요?{' '}
            </span>
            <Link
              to="/login"
              className="text-emerald-600 text-sm font-medium hover:text-emerald-700"
            >
              로그인
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyNewComponent;
