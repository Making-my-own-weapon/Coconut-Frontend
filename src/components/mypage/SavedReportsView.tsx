import React, { useState, useEffect } from 'react';
import { Calendar, FileText, Trash2, Eye } from 'lucide-react';
import { getUserSavedReports, deleteSavedReport } from '../../api/reportApi';
import type { SavedReportListItem } from '../../api/reportApi';
import { showToast, showConfirm } from '../../utils/sweetAlert';
import { useNavigate } from 'react-router-dom';

interface SavedReportsViewProps {
  reports: SavedReportListItem[];
  loading: boolean;
  sortBy?: string;
  onDelete: (reportId: number) => void;
}

const SavedReportsView: React.FC<SavedReportsViewProps> = ({
  reports,
  loading,
  sortBy = '최신순',
  onDelete,
}) => {
  const navigate = useNavigate();

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

  if (sortedReports.length === 0) {
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
            <div className="flex items-center gap-3 flex-1">
              <div>
                <h3 className="text-lg font-semibold text-black mb-1">{report.room_title}</h3>
                <p className="text-sm text-slate-400">
                  저장일: {new Date(report.saved_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/saved-report/${report.id}`)}
                className="flex items-center gap-1 px-3 py-2 text-sm text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                상세보기
              </button>
              <button
                onClick={() => onDelete(report.id)}
                className="flex items-center gap-1 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
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
