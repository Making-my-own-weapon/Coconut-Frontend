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
  title: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'FINISHED';
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
  classStatus: 'WAITING' | 'IN_PROGRESS' | 'FINISHED';
  selectedStudentId: number | null;
  selectedProblemId: number | null;
  studentCodes: Record<number, string>;
  teacherCode: string;
  otherCursor: { lineNumber: number; column: number } | null;
  createRoom: (title: string, maxParticipants: number) => Promise<void>;
  fetchRoomDetails: (roomId: string) => Promise<void>;
  updateRoomStatus: (roomId: string) => Promise<void>;
  clearCreatedRoom: () => void;
  setSelectedStudentId: (studentId: number | null) => void;
  selectProblem: (problemId: number | null) => void;
  updateStudentCode: (studentId: number, code: string) => void;
  setTeacherCode: (code: string) => void;
  deleteRoom: (roomId: string) => Promise<void>;
  setOtherCursor: (cursor: { lineNumber: number; column: number } | null) => void;
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
  selectedStudentId: null,
  selectedProblemId: null,
  studentCodes: {},
  teacherCode: '', // 추가: 선생님 고유 코드 초기값
  otherCursor: null,

  // --- 액션 ---
  createRoom: async (title: string, maxParticipants: number) => {
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
      // 깊은 복사로 모든 상태를 새로운 객체/배열로 set
      const newRoom = JSON.parse(JSON.stringify(response.data));
      set({
        currentRoom: newRoom,
        students: Array.isArray(newRoom.participants) ? [...newRoom.participants] : [],
        problems: Array.isArray(newRoom.problems) ? [...newRoom.problems] : [],
        classStatus: newRoom.status,
      });
    } catch {
      set({ error: '방 정보를 불러오는 데 실패했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },

  updateRoomStatus: async (roomId: string) => {
    const newStatus = get().classStatus === 'IN_PROGRESS' ? 'FINISHED' : 'IN_PROGRESS';
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

  setSelectedStudentId: (studentId: number | null) => {
    set({ selectedStudentId: studentId });
  },

  selectProblem: (problemId: number | null) => {
    set({ selectedProblemId: problemId });
  },

  updateStudentCode: (studentId: number, code: string) => {
    set((state) => ({
      studentCodes: {
        ...state.studentCodes,
        [studentId]: code,
      },
    }));
  },

  setTeacherCode: (code: string) => {
    set({ teacherCode: code });
  },

  deleteRoom: async (roomId: string) => {
    set({ isLoading: true, error: null });
    try {
      await teacherApi.deleteRoomAPI(roomId);
      // 성공 시 관련 상태 초기화
      set({ currentRoom: null, students: [], problems: [], classStatus: 'WAITING' });
    } catch (err) {
      set({ error: '수업 삭제에 실패했습니다.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
  setOtherCursor: (cursor) => set({ otherCursor: cursor }),
}));
