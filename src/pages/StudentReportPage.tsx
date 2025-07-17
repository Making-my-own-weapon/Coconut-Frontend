import React from 'react';
import { useParams } from 'react-router-dom';
import { StudentReportDashboardView } from '../components/report';

const StudentReportPage = () => {
  const { roomId } = useParams<{ roomId: string }>();

  return <StudentReportDashboardView roomTitle={`Room ${roomId} - 학습 리포트`} />;
};

export default StudentReportPage;
