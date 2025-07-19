import React from 'react';

interface MyAccountComponentProps {
  userName?: string;
  userEmail?: string;
  lastPasswordUpdate?: string;
  onPasswordChange?: () => void;
  onAccountDeletion?: () => void;
}

const MyAccountManagementView: React.FC<MyAccountComponentProps> = ({
  userName,
  userEmail,
  lastPasswordUpdate = '2025-07-12', //하드 코딩 된 가짜 데이터
  onPasswordChange,
  onAccountDeletion,
}) => {
  return (
    <div className="flex-1 h-[900px] rounded-2xl border border-gray-200 bg-white shadow-md p-8">
      <div className="flex justify-between">
        <h1 className="text-black font-bold text-[32px] leading-[48px] mb-4">계정 관리</h1>
        <button className="text-blue-500 mr-[4px] hover:underline pb-4">수정하기</button>
      </div>
      {/* Container with responsive layout */}
      <div className="relative w-full">
        {/* Profile Avatar */}
        <div className="flex justify-center mb-16">
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
        <div className="grid grid-cols-2 gap-8 mb-20">
          {/* Name Field */}
          <div className="w-full">
            <label className="block text-gray-700 font-bold text-xl leading-6 mb-2">이름</label>
            <div className="w-full h-14 rounded-lg border border-gray-200 bg-gray-50 flex items-center px-4">
              <span className="text-black font-normal text-base leading-6">{userName}</span>
            </div>
          </div>

          {/* Email Field */}
          <div className="w-full">
            <label className="block text-gray-700 font-bold text-xl leading-6 mb-2">이메일</label>
            <div className="w-full h-14 rounded-lg border border-gray-200 bg-gray-50 flex items-center px-4">
              <span className="text-black font-normal text-base leading-6">{userEmail}</span>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="mb-20">
          <h2 className="text-black font-bold text-xl mb-6">비밀번호</h2>
          {/* Password Info Box */}
          <div className="w-full h-14 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-between px-4">
            <span className="text-black font-normal text-base leading-6">
              최종 업데이트: {lastPasswordUpdate}
            </span>
            <button
              onClick={onPasswordChange}
              className="text-blue-500 font-normal text-base leading-6 hover:underline transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 rounded px-2 py-1"
            >
              비밀번호 변경
            </button>
          </div>
        </div>

        {/* Account Deletion Link */}
        <div className="flex justify-center">
          <button
            onClick={onAccountDeletion}
            className="text-red-600 font-medium text-sm leading-7 hover:text-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50 rounded px-2 py-10"
          >
            회원탈퇴
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyAccountManagementView;
