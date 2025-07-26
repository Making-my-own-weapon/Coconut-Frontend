import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeacherStore } from '../store/teacherStore';
import { useGuestStore } from '../store/guestStore';
import HostActionContainer from '../components/join/HostActionContainer';
import GuestActionContainer from '../components/join/GuestActionContainer';
import Header from '../components/common/Header';

const JoinPage = () => {
  const navigate = useNavigate();

  // Host(교사)의 방 생성 흐름을 감시합니다.
  const { createdRoomInfo, clearCreatedRoom } = useTeacherStore();
  useEffect(() => {
    if (createdRoomInfo) {
      navigate(`/room/${createdRoomInfo.roomId}`);
      clearCreatedRoom();
    }
  }, [createdRoomInfo, navigate, clearCreatedRoom]);

  // Guest(참여자)의 방 참여 흐름을 감시합니다.
  const { joinedRoomInfo, clearJoinedRoom } = useGuestStore();
  useEffect(() => {
    if (joinedRoomInfo) {
      // 학생용 페이지 경로로 이동합니다 (예: /class/:roomId)
      // 이 경로는 App.tsx 라우터에 등록되어 있어야 합니다.
      navigate(`/class/${joinedRoomInfo.roomId}`);
      clearJoinedRoom();
    }
  }, [joinedRoomInfo, navigate, clearJoinedRoom]);

  return (
    <div className="bg-slate-50 min-h-screen">
      <Header />
      <div className="flex flex-col items-center mt-[70px]">
        <div className="w-full max-w-4xl p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <HostActionContainer />
            <GuestActionContainer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinPage;
