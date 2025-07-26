import React, { useState } from 'react';
import { useTeacherStore } from '../../store/teacherStore';
import ActionCard from './ActionCard';
import HostForm from './HostForm';
import RocketIcon from '../../assets/icons/RocketIcon';
import GraduationCapIcon from '../../assets/icons/GraduationCapIcon';

const HostActionContainer = () => {
  // 1. 스토어에서 액션과 상태를 가져옵니다.
  const { createRoom, isLoading, error } = useTeacherStore();

  // 2. UI 입력을 위한 상태는 컴포넌트에 둡니다.
  const [title, setTitle] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(4);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    // 3. 스토어의 액션을 호출합니다.
    // Form에서 입력받은 maxParticipants 값이 그대로 전달됩니다.
    await createRoom(title, maxParticipants);
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
