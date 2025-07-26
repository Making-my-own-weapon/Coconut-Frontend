import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
  studentCodes: Record<number, Record<number, string>>;
  teacherCode: string;
  otherCursor: { lineNumber: number; column: number; problemId: number | null } | null;
  createRoom: (title: string, maxParticipants: number) => Promise<void>;
  fetchRoomDetails: (roomId: string) => Promise<void>;
  updateRoomStatus: (roomId: string, endTime?: string) => Promise<void>;
  clearCreatedRoom: () => void;
  setSelectedStudentId: (studentId: number | null) => void;
  selectProblem: (problemId: number | null) => void;
  updateStudentCode: (studentId: number, problemId: number, code: string) => void;
  setTeacherCode: (code: string) => void;
  deleteRoom: (roomId: string) => Promise<void>;
  setOtherCursor: (
    cursor: { lineNumber: number; column: number; problemId: number | null } | null,
  ) => void;
  resetStore: () => void;
  studentCurrentProblems: Record<number, number | null>;
  setStudentCurrentProblem: (studentId: number, problemId: number | null) => void;
  studentMemos: Record<number, string>; // 학생별 메모
  setStudentMemo: (studentId: number, memo: string) => void;
  studentWrongProblems: Record<number, number[]>; // 학생별 오답(문제ID 배열)
  setStudentWrongProblems: (studentId: number, wrongProblems: number[]) => void;
  studentCorrectProblems: Record<number, number[]>; // 학생별 정답(문제ID 배열)
  setStudentCorrectProblems: (studentId: number, correctProblems: number[]) => void;
}

// --- 스토어 생성 ---

export const useTeacherStore = create<TeacherState>()(
  persist(
    (set, get) => ({
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
      studentCurrentProblems: {},
      studentMemos: {},
      studentWrongProblems: {},
      studentCorrectProblems: {},

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
        } catch (err) {
          set({ error: '방 정보를 불러오는 데 실패했습니다.' });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      updateRoomStatus: async (roomId: string, endTime?: string) => {
        const newStatus = get().classStatus === 'IN_PROGRESS' ? 'FINISHED' : 'IN_PROGRESS';
        try {
          await teacherApi.updateRoomStatusAPI(roomId, newStatus, endTime);
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

      updateStudentCode: (studentId: number, problemId: number, code: string) => {
        set((state) => ({
          studentCodes: {
            ...state.studentCodes,
            [studentId]: {
              ...(state.studentCodes[studentId] || {}),
              [problemId]: code,
            },
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
      resetStore: () =>
        set({
          teacherCode: '',
          studentCodes: {},
          selectedStudentId: null,
          selectedProblemId: null,
          studentCurrentProblems: {},
          studentMemos: {},
          studentWrongProblems: {},
          studentCorrectProblems: {},
          // 필요에 따라 다른 상태도 초기화 가능
        }),
      setStudentCurrentProblem: (studentId, problemId) => {
        set((state) => ({
          studentCurrentProblems: {
            ...state.studentCurrentProblems,
            [studentId]: problemId,
          },
        }));
      },
      setStudentMemo: (studentId, memo) => {
        set((state) => ({
          studentMemos: {
            ...state.studentMemos,
            [studentId]: memo,
          },
        }));
      },
      setStudentWrongProblems: (studentId, wrongProblems) => {
        set((state) => ({
          studentWrongProblems: {
            ...state.studentWrongProblems,
            [studentId]: wrongProblems,
          },
        }));
      },
      setStudentCorrectProblems: (studentId, correctProblems) => {
        set((state) => ({
          studentCorrectProblems: {
            ...state.studentCorrectProblems,
            [studentId]: correctProblems,
          },
        }));
      },
    }),
    {
      name: 'teacher-storage',
      partialize: (state) => ({
        teacherCode: state.teacherCode,
        studentCodes: state.studentCodes,
        selectedStudentId: state.selectedStudentId,
        selectedProblemId: state.selectedProblemId,
        studentCurrentProblems: state.studentCurrentProblems,
        studentCorrectProblems: state.studentCorrectProblems,
        studentWrongProblems: state.studentWrongProblems,
        studentMemos: state.studentMemos,
      }),
    },
  ),
);

// --- 소켓 이벤트 리스너: 채점 결과 수신 및 상태 갱신 ---
import socket from '../lib/socket';
import { useEffect } from 'react';

export function useSubmissionResultSocketListener() {
  const setStudentWrongProblems = useTeacherStore((s) => s.setStudentWrongProblems);
  const setStudentCorrectProblems = useTeacherStore((s) => s.setStudentCorrectProblems);
  const studentWrongProblems = useTeacherStore((s) => s.studentWrongProblems);
  const studentCorrectProblems = useTeacherStore((s) => s.studentCorrectProblems);

  useEffect(() => {
    const handler = (payload: { studentId: number; problemId: number; isCorrect: boolean }) => {
      const { studentId, problemId, isCorrect } = payload;
      console.log('[선생님] student:submissionResult 수신', payload);
      // 정답 처리
      let correct = studentCorrectProblems[studentId] || [];
      let wrong = studentWrongProblems[studentId] || [];
      if (isCorrect) {
        if (!correct.includes(problemId)) {
          correct = [...correct, problemId];
        }
        // 맞은 문제는 오답에서 제거
        wrong = wrong.filter((pid) => pid !== problemId);
      } else {
        // 오답은 맞은 문제에 없을 때만 추가 (이미 틀린 문제에 있으면 중복 추가 안 함)
        if (!correct.includes(problemId)) {
          wrong = [...wrong, problemId];
        }
      }
      console.log('[선생님] 맞은 문제:', correct, '틀린 문제:', wrong);
      setStudentCorrectProblems(studentId, correct);
      setStudentWrongProblems(studentId, wrong);
    };
    socket.on('student:submissionResult', handler);
    return () => {
      socket.off('student:submissionResult', handler);
    };
  }, [
    setStudentWrongProblems,
    setStudentCorrectProblems,
    studentWrongProblems,
    studentCorrectProblems,
  ]);
}
