import React, { useState } from 'react';
import { showConfirm } from '../../utils/sweetAlert';
import Swal from 'sweetalert2';
import PasswordChangeModal from './PasswordChangeModal';

interface MyAccountComponentProps {
  userName?: string;
  userEmail?: string;
  lastPasswordUpdate?: string;
  onPasswordChange?: (currentPassword: string, newPassword: string) => Promise<void>;
  onAccountDeletion?: () => void;
}

const MyAccountManagementView: React.FC<MyAccountComponentProps> = ({
  userName,
  userEmail,
  lastPasswordUpdate,
  onPasswordChange,
  onAccountDeletion,
}) => {
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const handleAccountDeletion = async () => {
    const result = await Swal.fire({
      title: '회원 탈퇴',
      text: '정말로 회원 탈퇴를 하시겠습니까? 이 작업은 되돌릴 수 없습니다.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626', // red-600
      cancelButtonColor: '#6b7280', // gray-500
      confirmButtonText: '탈퇴하기',
      cancelButtonText: '취소',
      background: '#ffffff', // white
      color: '#1f2937', // gray-800
    });

    if (result.isConfirmed && onAccountDeletion) {
      onAccountDeletion();
    }
  };
  return (
    <div className="flex-1 h-[900px] rounded-2xl border border-gray-200 bg-white shadow-md p-8">
      <div className="flex justify-between">
        <h1 className="text-black font-bold text-[32px] leading-[48px] mb-4">계정 관리</h1>
      </div>
      {/* Container with responsive layout */}
      <div className="relative w-full">
        {/* User Information Section */}
        <div className="grid grid-cols-2 gap-8 mb-20 mt-10">
          {/* Name Field */}
          <div className="w-full">
            <label className="text-gray-700 font-bold text-xl leading-6 mb-2">이름</label>
            <div className="w-full h-14 rounded-lg border border-gray-200 bg-gray-50 flex items-center px-4">
              <span className="text-black font-normal text-base leading-6">{userName}</span>
            </div>
          </div>

          {/* Email Field */}
          <div className="w-full">
            <label className="text-gray-700 font-bold text-xl leading-6 mb-2">이메일</label>
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
              onClick={() => setIsPasswordModalOpen(true)}
              className="text-blue-500 font-normal text-base leading-6 hover:underline transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50 rounded px-2 py-1"
            >
              비밀번호 변경
            </button>
          </div>
        </div>

        {/* Account Deletion Link */}
        <div className="flex justify-center">
          <button
            onClick={handleAccountDeletion}
            className="text-red-600 font-medium text-sm leading-7 hover:text-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50 rounded px-2 py-10"
          >
            회원탈퇴
          </button>
        </div>
      </div>

      {/* 비밀번호 변경 모달 */}
      {onPasswordChange && (
        <PasswordChangeModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          onSubmit={onPasswordChange}
        />
      )}
    </div>
  );
};

export default MyAccountManagementView;
