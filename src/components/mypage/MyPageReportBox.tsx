import React, { useState, useEffect } from 'react';
import SavedReportsView from './SavedReportsView';
import { getUserSavedReports } from '../../api/reportApi';
import type { SavedReportListItem } from '../../api/reportApi';
import { showToast, showConfirm } from '../../utils/sweetAlert';
import { deleteSavedReport } from '../../api/reportApi';

interface MyPageReportBoxProps {
  className?: string;
  onTabChange?: (tab: 'create' | 'join' | 'saved') => void;
  onSortChange?: (sort: string) => void;
}

const MyPageReportBox: React.FC<MyPageReportBoxProps> = ({ className = '' }) => {
  const [reports, setReports] = useState<SavedReportListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        const response = await getUserSavedReports();
        if (response.success) {
          setReports(response.data);
        }
      } catch (e) {
        // 에러 무시
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  // 정렬 함수 및 관련 로직 제거, reports 그대로 사용
  const allReports = reports;

  // 삭제 핸들러
  const handleDeleteReport = async (reportId: number) => {
    const confirmed = await showConfirm('리포트 삭제', '리포트를 삭제하시겠습니까?');
    if (!confirmed) return;
    try {
      const response = await deleteSavedReport(reportId);
      if (response.success) {
        setReports((prev) => prev.filter((report) => report.id !== reportId));
        showToast('success', '리포트가 삭제되었습니다.');
      } else {
        showToast('error', response.message || '리포트 삭제에 실패했습니다.');
      }
    } catch (error) {
      showToast('error', '리포트 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      {/* 제목 */}
      <div className="flex-shrink-0">
        <h1 className="text-black font-bold text-[32px] leading-[48px] mb-1">리포트</h1>
        <span className="text-gray-500">내 리포트를 볼 수 있습니다.</span>
      </div>

      {/* 리포트 리스트만 표시 */}
      <div className="flex-1 overflow-y-auto mt-8">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-gray-400">로딩 중...</div>
        ) : (
          <SavedReportsView reports={allReports} loading={loading} onDelete={handleDeleteReport} />
        )}
      </div>
    </div>
  );
};

export default MyPageReportBox;
