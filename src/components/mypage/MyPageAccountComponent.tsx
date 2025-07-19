import React from 'react';

interface MyAccountComponentProps {
  userName?: string;
  userEmail?: string;
  lastPasswordUpdate?: string;
  onPasswordChange?: () => void;
  onAccountDeletion?: () => void;
}

const MyAccountComponent: React.FC<MyAccountComponentProps> = ({
  userName,
  userEmail,
  lastPasswordUpdate = '2025-07-12',
  onPasswordChange,
  onAccountDeletion,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Container with responsive layout */}
      <div className="relative w-full">
        {/* Profile Avatar */}
        <div className="flex justify-center mb-8 lg:mb-12">
          <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-64 lg:h-64 rounded-full bg-gray-300 flex-shrink-0">
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 257 257"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="rounded-full"
            >
              <circle cx="128.5" cy="128.5" r="128.5" fill="#D9D9D9" />
            </svg>
          </div>
        </div>

        {/* User Information Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8 lg:mb-12">
          {/* Name Field */}
          <div className="w-full">
            <label className="block text-gray-700 font-medium text-base leading-6 mb-2">이름</label>
            <div className="w-full h-14 rounded-lg border border-gray-200 bg-gray-50 flex items-center px-4">
              <span className="text-black font-normal text-base leading-6">{userName}</span>
            </div>
          </div>

          {/* Email Field */}
          <div className="w-full">
            <label className="block text-gray-700 font-medium text-base leading-6 mb-2">
              이메일
            </label>
            <div className="w-full h-14 rounded-lg border border-gray-200 bg-gray-50 flex items-center px-4">
              <span className="text-black font-normal text-base leading-6">{userEmail}</span>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="mb-8 lg:mb-12">
          <h2 className="text-black font-bold text-2xl lg:text-3xl leading-tight mb-6 lg:mb-8">
            비밀번호
          </h2>

          {/* Password Info Box */}
          <div className="w-full h-14 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-between px-4">
            <span className="text-black font-normal text-base leading-6">
              최종 업데이트: {lastPasswordUpdate}
            </span>
            <button
              onClick={onPasswordChange}
              className="text-black font-normal text-base leading-6 hover:text-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 rounded px-2 py-1"
            >
              비밀번호 변경
            </button>
          </div>
        </div>

        {/* Account Deletion Link */}
        <div className="flex justify-center">
          <button
            onClick={onAccountDeletion}
            className="text-red-600 font-medium text-lg leading-7 hover:text-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50 rounded px-2 py-1"
          >
            회원탈퇴
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyAccountComponent;
