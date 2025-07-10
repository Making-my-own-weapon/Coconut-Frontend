import React from 'react';
import type { Student } from '../../../store/teacherStore';
import { useTeacherStore } from '../../../store/teacherStore';
import GridCard from './GridCard';

// 1. 컴포넌트가 'students' 배열을 prop으로 받도록 정의합니다.
interface StudentGridViewProps {
  students: Student[];
  onStudentSelect: (studentId: number | null) => void;
  isConnecting?: boolean; // 추가: 학생 연결 중 상태
}

const StudentGridView: React.FC<StudentGridViewProps> = ({
  students,
  onStudentSelect,
  isConnecting = false,
}) => {
  // 2. useRoom 훅과 loading 상태 관리를 제거합니다.
  //    로딩 상태는 부모인 TeacherClassPage에서 이미 처리하고 있습니다.
  const { selectedStudentId } = useTeacherStore();

  return (
    <div>
      {/* 내 코드로 전환 버튼 제거 */}
      <div
        className="flex-1 min-h-0 w-full grid gap-6 px-6 py-8 auto-rows-fr"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
      >
        {students.length > 0 ? (
          students.map((student) => (
            <GridCard
              key={student.userId}
              student={student}
              selectedStudentId={selectedStudentId}
              onStudentSelect={onStudentSelect}
              isConnecting={isConnecting}
            />
          ))
        ) : (
          <div className="col-span-full flex items-center justify-center text-slate-500">
            <p>아직 참여한 학생이 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentGridView;
