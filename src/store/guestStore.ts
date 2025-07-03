import { create } from 'zustand';
import * as guestApi from '../api/guestApi';

// 참여 성공 시 받게 될 방 정보 타입
interface JoinedRoomInfo {
  roomId: number;
  title: string;
  // ... API 명세서에 따른 다른 속성들
}

// 스토어의 상태 및 액션 타입
interface GuestState {
  isLoading: boolean;
  error: string | null;
  joinedRoomInfo: JoinedRoomInfo | null;
  joinRoom: (inviteCode: string) => Promise<void>;
  clearJoinedRoom: () => void;
}

export const useGuestStore = create<GuestState>((set) => ({
  isLoading: false,
  error: null,
  joinedRoomInfo: null,

  joinRoom: async (inviteCode: string) => {
    set({ isLoading: true, error: null, joinedRoomInfo: null });
    try {
      const response = await guestApi.joinRoomAPI(inviteCode);
      set({ joinedRoomInfo: response.data });
    } catch (err) {
      set({ error: '수업 참여에 실패했습니다. 초대코드를 확인해주세요.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  clearJoinedRoom: () => {
    set({ joinedRoomInfo: null });
  },
}));
