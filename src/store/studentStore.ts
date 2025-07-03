import { create } from 'zustand';
// 교사와 학생이 공통으로 사용하는 API와 타입을 각자의 파일에서 가져옵니다.
import { getRoomDetailsAPI } from '../api/teacherApi';
import { type RoomInfo as Room, type Student, type Problem } from './teacherStore';

// 학생 스토어의 상태 및 액션 타입
interface StudentState {
  isLoading: boolean;
  error: string | null;
  currentRoom: Room | null;
  students: Student[];
  problems: Problem[];
  fetchRoomDetails: (roomId: string) => Promise<void>;
}

export const useStudentStore = create<StudentState>((set) => ({
  // --- 초기 상태 ---
  isLoading: false,
  error: null,
  currentRoom: null,
  students: [],
  problems: [],

  // --- 액션 ---
  fetchRoomDetails: async (roomId: string) => {
    set({ isLoading: true, error: null });
    try {
      // teacherApi에 만들어 둔 방 정보 조회 API를 재사용합니다.
      const response = await getRoomDetailsAPI(roomId);
      set({
        currentRoom: response.data,
        students: response.data.participants || [],
        problems: response.data.problems || [],
      });
    } catch {
      set({ error: '수업 정보를 불러오는 데 실패했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },
}));
