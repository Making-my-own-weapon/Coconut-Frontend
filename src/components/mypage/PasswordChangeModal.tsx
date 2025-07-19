import React, { useState } from 'react';
import Swal from 'sweetalert2';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (currentPassword: string, newPassword: string) => Promise<void>;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 비밀번호 유효성 검사
    if (formData.newPassword.length < 8) {
      Swal.fire({
        icon: 'error',
        title: '비밀번호 오류',
        text: '새 비밀번호는 최소 8자 이상이어야 합니다.',
        background: '#ffffff',
        color: '#1f2937',
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: '비밀번호 오류',
        text: '새 비밀번호가 일치하지 않습니다.',
        background: '#ffffff',
        color: '#1f2937',
      });
      return;
    }

    if (formData.currentPassword === formData.newPassword) {
      Swal.fire({
        icon: 'error',
        title: '비밀번호 오류',
        text: '새 비밀번호는 현재 비밀번호와 달라야 합니다.',
        background: '#ffffff',
        color: '#1f2937',
      });
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData.currentPassword, formData.newPassword);

      // 성공 메시지
      Swal.fire({
        icon: 'success',
        title: '비밀번호 변경 완료',
        text: '비밀번호가 성공적으로 변경되었습니다.',
        background: '#ffffff',
        color: '#1f2937',
      });

      // 폼 초기화 및 모달 닫기
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      onClose();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: '비밀번호 변경 실패',
        text: '현재 비밀번호가 올바르지 않거나 변경 중 오류가 발생했습니다.',
        background: '#ffffff',
        color: '#1f2937',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">비밀번호 변경</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 현재 비밀번호 */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">현재 비밀번호</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="현재 비밀번호를 입력하세요"
              required
            />
          </div>

          {/* 새 비밀번호 */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">새 비밀번호</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="새 비밀번호를 입력하세요 (8자 이상)"
              required
            />
          </div>

          {/* 새 비밀번호 확인 */}
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">새 비밀번호 확인</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="새 비밀번호를 다시 입력하세요"
              required
            />
          </div>

          {/* 버튼 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-10 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium rounded-md transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors disabled:opacity-50"
            >
              {isLoading ? '변경 중...' : '변경하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordChangeModal;
