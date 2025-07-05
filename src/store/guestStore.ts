import { create } from 'zustand';
import * as guestApi from '../api/guestApi';
import { isAxiosError } from 'axios';

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
  joinRoom: (inviteCode: string, userName: string) => Promise<void>;
  clearJoinedRoom: () => void;
}

export const useGuestStore = create<GuestState>((set) => ({
  isLoading: false,
  error: null,
  joinedRoomInfo: null,

  joinRoom: async (inviteCode: string, userName: string) => {
    set({ isLoading: true, error: null, joinedRoomInfo: null });
    try {
      const response = await guestApi.joinRoomAPI(inviteCode, userName);
      set({ joinedRoomInfo: response.data });
    } catch (err) {
      // isAxiosError로 axios 에러인지 확인
      if (isAxiosError(err) && err.response) {
        // 백엔드가 보낸 실제 에러 메시지를 상태에 저장
        set({ error: err.response.data.message });
      } else {
        // 그 외의 에러일 경우 일반 메시지 사용
        set({ error: '수업 참여 중 알 수 없는 에러가 발생했습니다.' });
      }
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  clearJoinedRoom: () => {
    set({ joinedRoomInfo: null });
  },
}));
