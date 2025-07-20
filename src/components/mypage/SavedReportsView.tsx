import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Trash2, Eye } from 'lucide-react';
import { getUserSavedReports, deleteSavedReport } from '../../api/reportApi';
import type { SavedReportListItem } from '../../api/reportApi';
import { showToast } from '../../utils/sweetAlert';

interface SavedReportsViewProps {
  sortBy?: string;
}

const SavedReportsView: React.FC<SavedReportsViewProps> = ({ sortBy = '최신순' }) => {
  const [reports, setReports] = useState<SavedReportListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedReports();
  }, []);

  const loadSavedReports = async () => {
    try {
      setLoading(true);
      const response = await getUserSavedReports();
      if (response.success) {
        setReports(response.data);
      }
    } catch (error) {
      console.error('저장된 리포트 조회 실패:', error);
      showToast('error', '저장된 리포트를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId: number, roomTitle: string) => {
    if (!window.confirm(`"${roomTitle}" 리포트를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      const response = await deleteSavedReport(reportId);
      if (response.success) {
        showToast('success', '리포트가 삭제되었습니다.');
        setReports(reports.filter((report) => report.id !== reportId));
      } else {
        showToast('error', response.message || '리포트 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('리포트 삭제 실패:', error);
      showToast('error', '리포트 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleViewReport = (reportId: number) => {
    // 저장된 리포트 상세 페이지로 이동 (추후 구현)
    showToast('info', '리포트 상세 보기 기능은 곧 추가될 예정입니다.');
  };

  // 정렬 로직
  const sortedReports = [...reports].sort((a, b) => {
    switch (sortBy) {
      case '최신순':
        return new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime();
      case '오래된순':
        return new Date(a.saved_at).getTime() - new Date(b.saved_at).getTime();
      case '이름순':
        return a.room_title.localeCompare(b.room_title);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">저장된 리포트를 불러오는 중...</div>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <FileText className="w-16 h-16 mb-4 text-gray-300" />
        <div className="text-lg font-medium mb-2">저장된 리포트가 없습니다</div>
        <div className="text-sm">수업 종료 후 리포트를 저장해보세요!</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedReports.map((report) => (
        <div
          key={report.id}
          className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.room_title}</h3>
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Calendar className="w-4 h-4 mr-1" />
                저장일:{' '}
                {new Date(report.saved_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => handleViewReport(report.id)}
                className="flex items-center gap-1 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Eye className="w-4 h-4" />
                보기
              </button>
              <button
                onClick={() => handleDeleteReport(report.id, report.room_title)}
                className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                삭제
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavedReportsView;
