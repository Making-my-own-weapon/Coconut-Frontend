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
      // 방 입장 성공 시 sessionStorage에 inviteCode, userId 저장
      // inviteCode는 인자로, userId는 response.data에서 추출(없으면 강제로 저장)
      window.sessionStorage.setItem('inviteCode', inviteCode);
      // userId가 없어도 강제로 저장 (로그인 정보에서 가져오거나 임시값 사용)
      const userId = response.data?.userId || window.sessionStorage.getItem('loginUserId') || '1';
      window.sessionStorage.setItem('userId', String(userId));
      // 디버깅용 로그
      console.log('[게스트 입장] sessionStorage 저장', {
        inviteCode,
        userId: userId,
      });
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
