import { create } from 'zustand';
import { getRoomDetailsAPI } from '../api/teacherApi';
import { type RoomInfo as Room, type Student, type Problem } from './teacherStore';

// 학생 스토어의 상태 및 액션 타입
interface StudentState {
  isLoading: boolean;
  error: string | null;
  currentRoom: Room | null;
  students: Student[];
  problems: Problem[];
  codes: Record<string, string>;
  selectedProblemId: number | null;
  fetchRoomDetails: (roomId: string) => Promise<void>;
  selectProblem: (problemId: number | null) => void;
  updateCode: (payload: { problemId: number; code: string }) => void;
}

export const useStudentStore = create<StudentState>((set) => ({
  // --- 초기 상태 ---
  isLoading: false,
  error: null,
  currentRoom: null,
  students: [],
  problems: [],
  codes: {},
  selectedProblemId: null,

  // --- 액션 ---
  fetchRoomDetails: async (roomId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await getRoomDetailsAPI(roomId);
      const problems = response.data.problems || [];
      let initialCodes = {};
      let firstProblemId = null;

      if (problems.length > 0) {
        firstProblemId = problems[0].problemId;
        initialCodes = problems.reduce((acc: Record<string, string>, p: Problem) => {
          acc[p.problemId] = `# 문제 ${p.problemId}번\n# 여기에 코드를 입력하세요.`;
          return acc;
        }, {});
      }

      set({
        currentRoom: response.data,
        students: response.data.participants || [],
        problems: problems,
        codes: initialCodes,
        selectedProblemId: firstProblemId,
      });
    } catch {
      set({ error: '수업 정보를 불러오는 데 실패했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },

  selectProblem: (problemId: number | null) => {
    set({ selectedProblemId: problemId });
  },

  updateCode: ({ problemId, code }: { problemId: number; code: string }) => {
    set((state) => ({
      codes: {
        ...state.codes,
        [problemId]: code,
      },
    }));
  },
}));
