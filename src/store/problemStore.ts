import { create } from 'zustand';
import * as problemApi from '../api/problemApi';
import type { CreateProblemDto } from '../api/problemApi';
import { useTeacherStore } from './teacherStore';

export interface ProblemSummary {
  problemId: number;
  title: string;
  source: 'My' | 'BOJ' | 'CSES';
  categories: string[];
}

// 스토어의 상태와 액션 타입을 정의합니다.
interface ProblemState {
  isLoading: boolean;
  error: string | null;
  summaries: ProblemSummary[]; // 문제 요약 목록 상태
  selectedIds: Set<number>; // 선택된 문제 ID 상태 (Set으로 중복 방지)
  fetchAllSummaries: () => Promise<void>;
  toggleProblemSelection: (id: number) => void;
  assignSelectedProblems: (roomId: number) => Promise<void>;
  createAndAssignProblem: (dto: CreateProblemDto, roomId: number) => Promise<void>;
  removeProblemFromRoom: (roomId: number, problemId: number) => Promise<void>; // 추가
}

export const useProblemStore = create<ProblemState>((set, get) => ({
  isLoading: false,
  error: null,
  summaries: [],
  selectedIds: new Set(),

  // 모든 문제 요약 목록을 불러오는 액션
  fetchAllSummaries: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await problemApi.fetchAllSummariesAPI();
      set({ summaries: response.data });
    } catch {
      set({ error: '문제 목록을 불러오는 데 실패했습니다.' });
    } finally {
      set({ isLoading: false });
    }
  },

  // 문제 선택/해제 토글 액션
  toggleProblemSelection: (id: number) => {
    set((state) => {
      const newSelectedIds = new Set(state.selectedIds);
      if (newSelectedIds.has(id)) {
        newSelectedIds.delete(id);
      } else {
        newSelectedIds.add(id);
      }
      return { selectedIds: newSelectedIds };
    });
  },

  // 선택된 문제들을 방에 할당하는 액션
  assignSelectedProblems: async (roomId: number) => {
    set({ isLoading: true, error: null });
    const problemIds = Array.from(get().selectedIds); // Set을 배열로 변환
    if (problemIds.length === 0) {
      set({ error: '문제를 선택해주세요.', isLoading: false });
      throw new Error('문제를 선택해주세요.');
    }
    try {
      await problemApi.assignProblemsToRoomAPI(roomId, problemIds);
      set({ selectedIds: new Set() }); // 성공 시 선택 해제
      // 할당이 끝나면 방 정보를 다시 불러옵니다.
      await useTeacherStore.getState().fetchRoomDetails(String(roomId));
    } catch (err) {
      set({ error: '문제 할당에 실패했습니다.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // 문제 생성과 방 할당을 한 번에 처리하는 액션
  createAndAssignProblem: async (dto, roomId) => {
    set({ isLoading: true, error: null });
    try {
      // 1. 문제를 먼저 생성하고, 새로 생긴 문제의 ID를 받습니다.
      const createResponse = await problemApi.createProblemAPI(dto);
      const newProblemId = createResponse.data.problemId;

      // 2. 그 ID를 이용해 현재 방에 문제를 할당합니다.
      await problemApi.assignProblemsToRoomAPI(roomId, [newProblemId]);
    } catch (err) {
      console.error(err);
      set({ error: '문제 생성 또는 할당에 실패했습니다.' });
      throw err; // 에러를 다시 던져서 컴포넌트에서 인지할 수 있게 합니다.
    } finally {
      set({ isLoading: false });
    }
  },
  // 방에서 문제를 삭제하는 액션
  removeProblemFromRoom: async (roomId, problemId) => {
    set({ isLoading: true, error: null });
    try {
      await problemApi.deleteProblemFromRoomAPI(roomId, problemId);
      // 삭제 후 방 정보 갱신
      await useTeacherStore.getState().fetchRoomDetails(String(roomId));
    } catch (err) {
      set({ error: '문제 삭제에 실패했습니다.' });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
}));
