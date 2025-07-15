import React from 'react';
import ReportHeader from './ReportHeader';

interface ReportLayoutProps {
  children: React.ReactNode;
  actions?: React.ReactNode;
  tabs: React.ReactNode;
  roomTitle?: string;
}

const ReportLayout: React.FC<ReportLayoutProps> = ({ children, actions, tabs, roomTitle }) => {
  return (
    <div className="w-full min-h-screen bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-screen-2xl mx-auto">
        <ReportHeader roomTitle={roomTitle} />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center my-8">
          <div className="mt-8">
            <h1 className="text-4xl lg:text-5xl font-extrabold">리포트</h1>
            <p className="text-slate-400 mt-1">실시간 학습 현황 및 성과 분석</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">{tabs}</div>
        </div>

        {/* 페이지별 실제 컨텐츠가 이 부분에 표시됩니다. */}
        <main>{children}</main>

        {actions && (
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">{actions}</div>
        )}
      </div>
    </div>
  );
};

export default ReportLayout;
