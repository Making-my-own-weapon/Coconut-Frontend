//src/components/join/GuestActionContainer.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { joinRoomAPI } from './api/roomService';
import ActionCard from './ActionCard';
import GuestForm from './GuestForm';
import PlayIcon from '../../assets/icons/PlayIcon';
import DocumentIcon from '../../assets/icons/DocumentIcon';

const GuestActionContainer = () => {
  const navigate = useNavigate();

  // '참여자' 기능에 필요한 모든 상태를 여기서 관리합니다.
  const [inviteCode, setInviteCode] = useState('');
  const [userName, setUserName] = useState('');
  const userId = Math.floor(Math.random() * 10000) + 1;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // '수업 참여하기' 버튼 클릭 시 실행될 함수
  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const data = await joinRoomAPI(inviteCode, userId);
      // 성공 시, 서버에서 받은 방 정보(data)와 사용자가 입력한 이름(userName)을 가지고
      // 실제 수업 페이지로 이동합니다.
      navigate(`/class/${data.roomId}`, {
        state: { roomInfo: data, myName: userName },
      });
    } catch (err) {
      // API 호출 실패 시 에러 메시지를 상태에 저장하여 사용자에게 보여줍니다.
      setError('참여에 실패했습니다. 초대코드를 확인해주세요.');
      console.error(err);
    } finally {
      // API 호출이 성공하든 실패하든, 로딩 상태를 해제합니다.
      setIsLoading(false);
    }
  };

  return (
    <ActionCard
      icon={<DocumentIcon className="w-6 h-6 text-white" />}
      iconBgColor="bg-green-600"
      title="참여자로 시작"
      description="수업 ID로 실시간 코딩 세션에 참여하고 선생님의 도움을 받아 더 나은 코드를 작성하세요."
      buttonIcon={<PlayIcon />}
      buttonText={isLoading ? '참여 중...' : '수업 참여하기'}
      buttonColor={isLoading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}
      onSubmit={handleJoinClass}
    >
      {/* 자식 컴포넌트에 상태와 상태 변경 함수를 props로 전달 */}
      <GuestForm
        inviteCode={inviteCode}
        setInviteCode={setInviteCode}
        userName={userName}
        setUserName={setUserName}
      />
      {/* 에러가 있을 경우 메시지를 표시 */}
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </ActionCard>
  );
};

export default GuestActionContainer;
