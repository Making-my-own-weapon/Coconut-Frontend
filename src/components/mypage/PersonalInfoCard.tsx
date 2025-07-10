import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const PersonalInfoCard: React.FC = () => {
  const { user, deleteAccount } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleDeleteClick = () => {
    setError('');
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteAccount();
      navigate('/');
    } catch {
      setError('계정 삭제에 실패했습니다. 다시 시도해주세요.');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="w-full lg:w-[832px] h-auto relative">
      <div className="w-full h-full rounded-2xl border bg-white shadow-lg relative min-h-[516px] pb-20">
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 pt-6 sm:pt-7 pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-black">개인정보</h1>
          <div className="flex items-center gap-2 text-base">
            <button className="text-black hover:text-gray-600 transition-colors">수정하기</button>
            <span className="text-black">|</span>
            <button className="text-black hover:text-gray-600 transition-colors">취소</button>
          </div>
        </div>

        {/* Form Fields */}
        <div className="px-6 sm:px-8 space-y-6">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
            {/* Name Field */}
            <div className="w-full lg:w-[367px]">
              <label className="block text-base font-medium text-gray-700 mb-2">이름</label>
              <div className="w-full h-[58px] rounded-lg border border-gray-200 bg-gray-50 px-4 flex items-center">
                <span className="text-base text-black">{user?.name}</span>
              </div>
            </div>
            {/* Gender Field (성별 데이터가 없으므로 우선 비워둡니다) */}
            <div className="w-full lg:w-[367px]">
              <label className="block text-base font-medium text-gray-700 mb-2">성별</label>
              <div className="w-full h-[58px] rounded-lg border border-gray-200 bg-gray-50 px-4 flex items-center">
                <span className="text-base text-black"></span>
              </div>
            </div>
          </div>

          {/* Email Field */}
          <div className="w-full lg:w-[367px]">
            <label className="block text-base font-medium text-gray-700 mb-2">이메일</label>
            <div className="w-full h-[58px] rounded-lg border border-gray-200 bg-gray-50 px-4 flex items-center">
              {/* 👇 하드코딩된 이메일 대신 user.email을 사용합니다. */}
              <span className="text-base text-black">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* 계정 삭제 버튼 */}
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2">
          <button
            onClick={handleDeleteClick}
            className="text-sm text-red-500 hover:text-red-700 hover:underline"
          >
            계정 삭제
          </button>
        </div>
      </div>

      {/* 확인 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-lg font-bold mb-2">정말 계정을 삭제하시겠습니까?</h3>
            <p className="text-sm text-gray-600 mb-4">이 작업은 되돌릴 수 없습니다.</p>
            {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                취소
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInfoCard;
