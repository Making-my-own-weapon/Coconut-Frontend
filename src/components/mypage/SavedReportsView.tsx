import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Trash2, Eye } from 'lucide-react';
import { getUserSavedReports, deleteSavedReport } from '../../api/reportApi';
import type { SavedReportListItem } from '../../api/reportApi';
import { showToast } from '../../utils/sweetAlert';
import { useNavigate } from 'react-router-dom';

interface SavedReportsViewProps {
  sortBy?: string;
}

const SavedReportsView: React.FC<SavedReportsViewProps> = ({ sortBy = '최신순' }) => {
  const [reports, setReports] = useState<SavedReportListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadSavedReports();
  }, []);

  // 컴포넌트가 포커스를 받을 때 데이터 새로고침 (탭 전환 시)
  useEffect(() => {
    const handleFocus = () => {
      loadSavedReports();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
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

  const handleDeleteReport = async (reportId: number) => {
    if (!window.confirm(`리포트를 삭제하시겠습니까?`)) {
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
    // 저장된 리포트 상세 페이지로 이동
    window.open(`/saved-report/${reportId}`, '_blank');
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">{report.room_title}</h3>
                <p className="text-sm text-slate-400">
                  저장일: {new Date(report.saved_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    report.report_type === 'teacher'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {report.report_type === 'teacher' ? '선생님 리포트' : '학생 리포트'}
                </span>
                <button
                  onClick={() => navigate(`/saved-report/${report.id}`)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  상세보기
                </button>
                <button
                  onClick={() => handleDeleteReport(report.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavedReportsView;
