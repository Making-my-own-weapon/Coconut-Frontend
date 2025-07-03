import React, { useState } from 'react';
import { useGuestStore } from '../../store/guestStore';
import ActionCard from './ActionCard';
import GuestForm from './GuestForm';
import PlayIcon from '../../assets/icons/PlayIcon';
import DocumentIcon from '../../assets/icons/DocumentIcon';

const GuestActionContainer = () => {
  // 1. 스토어에서 액션과 상태를 가져옵니다.
  const { joinRoom, isLoading, error } = useGuestStore();

  // 2. Form 입력을 위한 상태는 컴포넌트에 둡니다.
  const [inviteCode, setInviteCode] = useState('');
  const [userName, setUserName] = useState(''); // 수업 내에서 사용할 이름

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    // 3. 스토어의 액션을 호출합니다.
    await joinRoom(inviteCode);
  };

  return (
    <ActionCard
      icon={<DocumentIcon className="w-6 h-6 text-white" />}
      iconBgColor="bg-green-600"
      title="참여자로 시작"
      description="초대코드를 입력하여 실시간 코딩 세션에 참여하세요."
      buttonIcon={<PlayIcon />}
      buttonText={isLoading ? '참여 중...' : '수업 참여하기'}
      buttonColor={isLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}
      onSubmit={handleJoinClass}
    >
      <GuestForm
        inviteCode={inviteCode}
        setInviteCode={setInviteCode}
        userName={userName}
        setUserName={setUserName}
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </ActionCard>
  );
};

export default GuestActionContainer;
