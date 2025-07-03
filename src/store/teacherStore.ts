import { create } from 'zustand';
import * as teacherApi from '../api/teacherApi';

// 생성된 방의 정보 타입
interface CreatedRoomInfo {
  roomId: number;
  inviteCode: string;
}

// 스토어의 상태 및 액션 타입
interface TeacherState {
  isLoading: boolean;
  error: string | null;
  createdRoomInfo: CreatedRoomInfo | null;
  createRoom: (title: string, maxParticipants: number) => Promise<void>;
  clearCreatedRoom: () => void;
}

export const useTeacherStore = create<TeacherState>((set) => ({
  isLoading: false,
  error: null,
  createdRoomInfo: null,

  createRoom: async (title, maxParticipants) => {
    set({ isLoading: true, error: null, createdRoomInfo: null });

    try {
      const response = await teacherApi.createRoomAPI({
        title,
        maxParticipants,
        description: '새로운 수업입니다.',
      });
      set({ createdRoomInfo: response.data });
    } catch (err) {
      set({ error: '수업 생성에 실패했습니다. 다시 시도해주세요.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // 페이지 이동 후, 스토어의 방 정보를 초기화하는 액션
  clearCreatedRoom: () => {
    set({ createdRoomInfo: null });
  },
}));
