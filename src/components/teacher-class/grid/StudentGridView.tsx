import React from 'react';
import { useRoom } from '../../../hooks/useRoom';
import GridCard from './GridCard';

function StudentGridView() {
  const { students, loading } = useRoom();

  if (loading) {
    return <div className="p-5 text-center text-white">학생 정보를 불러오는 중입니다...</div>;
  }

  return (
    <div
      className="flex-1 min-h-0 w-full grid gap-6 px-6 py-8 auto-rows-fr"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
    >
      {students
        .filter(Boolean) // 런타임 에러 방지를 위한 안전장치
        .map((student) => (
          <GridCard key={student.id} student={student} />
        ))}
    </div>
  );
}

export default StudentGridView;
