import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  otherCursor: { lineNumber: number; column: number } | null;
  fetchRoomDetails: (roomId: string) => Promise<void>;
  selectProblem: (problemId: number | null) => void;
  updateCode: (payload: { problemId: number; code: string }) => void;
  setOtherCursor: (cursor: { lineNumber: number; column: number } | null) => void;
}

export const useStudentStore = create<StudentState>()(
  persist(
    (set) => ({
      // --- 초기 상태 ---
      isLoading: false,
      error: null,
      currentRoom: null,
      students: [],
      problems: [],
      codes: {},
      selectedProblemId: null,
      otherCursor: null,

      // --- 액션 ---
      fetchRoomDetails: async (roomId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await getRoomDetailsAPI(roomId);
          const problems = response.data.problems || [];

          // 기존 코드를 유지하면서 새로운 문제에 대해서만 초기 코드 설정
          set((state) => {
            const existingCodes = state.codes || {};
            const newCodes = { ...existingCodes };

            // 새로운 문제들에 대해서만 초기 코드 설정 (기존 코드가 없는 경우)
            problems.forEach((p: Problem) => {
              if (!newCodes[p.problemId]) {
                newCodes[p.problemId] = `# ${p.title}\n# 여기에 코드를 입력하세요.`;
              }
            });

            return {
              currentRoom: response.data,
              students: response.data.participants || [],
              problems: problems,
              codes: newCodes,
              selectedProblemId: state.selectedProblemId, // 기존 선택 유지
            };
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
      setOtherCursor: (cursor) => set({ otherCursor: cursor }),
    }),
    {
      name: 'student-storage',
      partialize: (state) => ({
        codes: state.codes,
        selectedProblemId: state.selectedProblemId,
        otherCursor: state.otherCursor,
      }),
    },
  ),
);
