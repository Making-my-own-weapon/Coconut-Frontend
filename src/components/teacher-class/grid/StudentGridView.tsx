import React from 'react';
import type { Student } from '../../../store/teacherStore';
import { useTeacherStore } from '../../../store/teacherStore';
import GridCard from './GridCard';
import socket from '../../../lib/socket';
import { useEffect } from 'react';
import { useSubmissionResultSocketListener } from '../../../store/teacherStore';

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
  const setStudentCurrentProblem = useTeacherStore((s) => s.setStudentCurrentProblem);

  useEffect(() => {
    const handler = (payload: { studentId: number; problemId: number }) => {
      console.log('[Teacher] student:currentProblem 수신', payload);
      setStudentCurrentProblem(payload.studentId, payload.problemId);
    };
    socket.on('student:currentProblem', handler);
    return () => {
      socket.off('student:currentProblem', handler);
    };
  }, [setStudentCurrentProblem]);

  useSubmissionResultSocketListener();

  return (
    <div className="w-full min-h-0 flex justify-center">
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10 px-8 py-10 max-w-6xl w-full place-items-center"
        style={{
          gridTemplateColumns:
            students.length >= 3
              ? 'repeat(2, minmax(420px, 1fr))'
              : 'repeat(1, minmax(420px, 1fr))',
        }}
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
