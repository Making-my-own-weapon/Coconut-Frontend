import { create } from 'zustand';
import * as reportApi from '../api/reportApi';

interface ReportData {
  averageSuccessRate: number;
  averageSolveTime: string;
  totalSubmissions: number;
  totalProblems: number;
  totalStudents: number;
  hardestProblem: { name: string; rate: number };
  easiestProblem: { name: string; rate: number };
  problemAnalysis: { title: string; successRate: number }[];
  studentSubmissions: { name: string; successRate: number }[];
}

interface ReportState {
  isLoading: boolean;
  error: string | null;
  reportData: ReportData | null; // 👈 확장된 타입으로 변경
  fetchReport: (roomId: string) => Promise<void>;
}

export const useReportStore = create<ReportState>((set) => ({
  isLoading: false,
  reportData: null,
  error: null,
  fetchReport: async (roomId: string) => {
    set({ isLoading: true });
    try {
      const response = await reportApi.getReportAPI(roomId);
      set({ reportData: response.data });
    } catch (error) {
      console.error('리포트 데이터 로딩 실패:', error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
