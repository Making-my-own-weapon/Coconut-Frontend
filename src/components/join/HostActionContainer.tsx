//src/components/join/HostActionContainer.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoomAPI } from './api/roomService';
import ActionCard from './ActionCard';
import HostForm from './HostForm';
import RocketIcon from '../../assets/icons/RocketIcon';
import GraduationCapIcon from '../../assets/icons/GraduationCapIcon';

const HostActionContainer = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(30);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState('');

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const randomUserId = Math.floor(Math.random() * 10000) + 1;
      const data = await createRoomAPI({
        title,
        description: '방 설명',
        maxParticipants,
        userId: randomUserId,
      });
      console.log('createRoomAPI result:', data);
      // navigate(`/class/${data.roomId}`);
      navigate(`/class/${data.roomId}`, {
        state: { roomInfo: data, myName: userName },
      });
    } catch {
      setError('수업 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ActionCard
      icon={<GraduationCapIcon />}
      iconBgColor="bg-blue-600"
      title="진행자로 시작"
      description="새로운 수업을 생성하고 학생들의 성장을 도와주세요. 분석 도구로 구문 맞춤 지도가 가능합니다."
      buttonIcon={<RocketIcon />}
      buttonText={isLoading ? '생성 중...' : '수업 생성하기'}
      buttonColor={isLoading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}
      onSubmit={handleCreateClass}
    >
      <HostForm
        title={title}
        setTitle={setTitle}
        maxParticipants={maxParticipants}
        setMaxParticipants={setMaxParticipants}
      />
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </ActionCard>
  );
};

export default HostActionContainer;
