import { create } from 'zustand';
import * as reportApi from '../api/reportApi';

interface ReportState {
  isLoading: boolean;
  reportData: { averageSuccessRate: number } | null;
  fetchReport: (roomId: string) => Promise<void>;
}

export const useReportStore = create<ReportState>((set) => ({
  isLoading: false,
  reportData: null,

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
