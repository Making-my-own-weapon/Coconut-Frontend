import { apiClient } from './client';

export interface SavedReportListItem {
  id: number;
  room_title: string;
  saved_at: string;
  report_type: 'teacher' | 'student';
}

export interface SavedReportDetail {
  id: number;
  user_id: number;
  room_title: string;
  report_data: any;
  saved_at: string;
  report_type: 'teacher' | 'student';
}

/**
 * 리포트를 저장합니다
 */
export const saveReport = async (
  roomId: string | number,
): Promise<{
  success: boolean;
  data?: {
    id: number;
    roomTitle: string;
    savedAt: string;
  };
  message?: string;
}> => {
  try {
    const response = await apiClient.post(`/reports/save/${roomId}`);
    return response.data;
  } catch (error) {
    console.error('리포트 저장 실패:', error);
    throw error;
  }
};

/**
 * 사용자의 저장된 리포트 목록을 조회합니다
 */
export const getUserSavedReports = async (): Promise<{
  success: boolean;
  data: SavedReportListItem[];
}> => {
  try {
    const response = await apiClient.get('/reports/saved');
    return response.data;
  } catch (error) {
    console.error('저장된 리포트 목록 조회 실패:', error);
    throw error;
  }
};

/**
 * 저장된 리포트 상세 데이터를 조회합니다
 */
export const getSavedReportDetail = async (
  reportId: number,
): Promise<{
  success: boolean;
  data?: SavedReportDetail;
  message?: string;
}> => {
  try {
    const response = await apiClient.get(`/reports/saved/${reportId}`);
    return response.data;
  } catch (error) {
    console.error('저장된 리포트 상세 조회 실패:', error);
    throw error;
  }
};

/**
 * 저장된 리포트를 삭제합니다
 */
export const deleteSavedReport = async (
  reportId: number,
): Promise<{
  success: boolean;
  message?: string;
}> => {
  try {
    const response = await apiClient.delete(`/reports/saved/${reportId}`);

    // 204 No Content 상태 코드인 경우 성공으로 처리
    if (response.status === 204) {
      return { success: true };
    }

    return response.data;
  } catch (error) {
    console.error('저장된 리포트 삭제 실패:', error);
    throw error;
  }
};

/**
 * 기존 리포트 조회 API (호환성 유지)
 */
export const getReportAPI = (roomId: string) => {
  return apiClient.get(`/rooms/${roomId}/report`);
};
