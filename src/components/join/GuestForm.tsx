import React from 'react';

// 이 폼이 부모로부터 받아야 할 props들을 정의합니다.
interface GuestFormProps {
  inviteCode: string;
  userName: string;
  setInviteCode: (value: string) => void;
  setUserName: (value: string) => void;
}

const GuestForm: React.FC<GuestFormProps> = ({
  inviteCode,
  userName,
  setInviteCode,
  setUserName,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="joinCode"
          className="block text-sm font-medium text-gray-700"
        >
          수업참여코드
        </label>
        <input
          id="joinCode"
          type="text"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          className="mt-1 w-full border rounded-md p-2 h-10"
          placeholder="수업 ID를 입력하세요"
          required
        />
      </div>
      <div>
        <label
          htmlFor="userName"
          className="block text-sm font-medium text-gray-700"
        >
          이름
        </label>
        <input
          id="userName"
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="mt-1 w-full border rounded-md p-2 h-10"
          placeholder="이름을 입력하세요"
          required
        />
      </div>
    </div>
  );
};

export default GuestForm;
