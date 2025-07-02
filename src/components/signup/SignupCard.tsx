import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth/authStore';

const SignupCard: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const signup = useAuthStore((state) => state.signup);
  const navigate = useNavigate();

  // 이 함수는 이제 input들의 onChange에서 사용됩니다.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 비밀번호 길이 검증 (프론트 단)
    if (formData.password.length < 8) {
      setError('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await signup(formData.name, formData.email, formData.password);
      alert('회원가입에 성공했습니다! 로그인 페이지로 이동합니다.');
      navigate('/login');
    } catch (err: any) {
      if (err.response && err.response.status === 409) {
        setError('이미 사용 중인 이메일입니다.');
      } else {
        setError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-blue-50 to-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg border border-gray-200 shadow-xl flex flex-col items-center p-6 sm:p-8">
        <div className="text-center mt-4 mb-8">
          <h1 className="text-gray-900 text-2xl font-bold tracking-tight">회원가입</h1>
          <p className="text-gray-600 text-base mt-1">새 계정을 만들어 Coconut을 시작하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="w-full">
          {error && <div className="text-red-500 text-sm text-center mb-4">{error}</div>}

          {/* Name */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">이름</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="핫식스"
              required
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">이메일</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="이메일을 입력하자"
              required
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">비밀번호</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-medium mb-2">비밀번호 확인</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-md shadow-lg disabled:opacity-50"
          >
            {loading ? '가입하는 중...' : '회원가입'}
          </button>

          <div className="text-center mt-4">
            <span className="text-gray-600 text-sm">이미 계정이 있으신가요? </span>
            {/* 이 Link 컴포넌트가 이제 사용됩니다. */}
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

export default SignupCard;
