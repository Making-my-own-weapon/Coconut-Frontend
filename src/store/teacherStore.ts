import { create } from 'zustand';
import * as teacherApi from '../api/teacherApi';

// --- 타입 정의 ---

export interface Student {
  userId: number;
  name: string;
  progress: number;
  timeComplexity: string;
  spaceComplexity: string;
  testsPassed: number;
  totalTests: number;
  isOnline: boolean;
}

export interface Problem {
  problemId: number;
  title: string;
  description: string;
  status: 'pass' | 'fail' | 'none';
  testCases: {
    id: number;
    input: string;
    expectedOutput: string;
    output: string;
  }[];
}

export interface RoomInfo {
  roomId: number;
  inviteCode: string;
  status: 'WAITING' | 'STARTED' | 'ENDED';
  participants: Student[];
  problems: Problem[];
}

interface TeacherState {
  isLoading: boolean;
  error: string | null;
  createdRoomInfo: RoomInfo | null;
  currentRoom: RoomInfo | null;
  students: Student[];
  problems: Problem[];
  classStatus: 'WAITING' | 'STARTED' | 'ENDED';
  createRoom: (title: string, maxParticipants: number) => Promise<void>;
  fetchRoomDetails: (roomId: string) => Promise<void>;
  updateRoomStatus: (roomId: string) => Promise<void>;
  clearCreatedRoom: () => void;
}

// --- 스토어 생성 ---

export const useTeacherStore = create<TeacherState>((set, get) => ({
  // --- 초기 상태 ---
  isLoading: false,
  error: null,
  createdRoomInfo: null,
  currentRoom: null,
  students: [],
  problems: [],
  classStatus: 'WAITING',

  // --- 액션 ---
  createRoom: async (title, maxParticipants) => {
    set({ isLoading: true, error: null, createdRoomInfo: null });
    try {
      const response = await teacherApi.createRoomAPI({
        title,
        maxParticipants,
        description: '새로운 수업입니다.',
      });
      set({
        createdRoomInfo: response.data,
        currentRoom: response.data,
        students: response.data.participants || [],
        problems: response.data.problems || [],
        classStatus: response.data.status,
      });
    } catch (err) {
      set({ error: '수업 생성에 실패했습니다.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRoomDetails: async (roomId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await teacherApi.getRoomDetailsAPI(roomId);
      set({
        currentRoom: response.data,
        students: response.data.participants || [],
        problems: response.data.problems || [],
        classStatus: response.data.status,
      });
    } catch {
      set({ error: '방 정보를 불러오는 데 실패했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateRoomStatus: async (roomId: string) => {
    const newStatus = get().classStatus === 'STARTED' ? 'ENDED' : 'STARTED';
    try {
      await teacherApi.updateRoomStatusAPI(roomId, newStatus);
      await get().fetchRoomDetails(roomId);
    } catch (err) {
      console.error('Failed to update room status', err);
      set({ error: '수업 상태 변경에 실패했습니다.' });
    }
  },

  clearCreatedRoom: () => {
    set({ createdRoomInfo: null });
  },
}));
