import React, { useState, useEffect } from 'react';
import BoardReportStudent from './BoardReportStudent';
import BoardReportStudentSubmission from './BoardReportStudentSubmission';

// 컴포넌트가 받을 데이터의 타입
interface StudentData {
  studentName: string;
  correctAnswers: number;
  submissions: any[];
}

interface StudentReportViewProps {
  studentResults: StudentData[];
  totalProblems: number;
  isStudentView?: boolean;
  currentStudentName?: string;
}

const StudentReportView: React.FC<StudentReportViewProps> = ({ studentResults }) => {
  // 1. 표시할 학생을 관리하는 상태. props로 받은 목록의 첫 번째 학생을 기본값으로 설정합니다.
  const [displayedStudent, setDisplayedStudent] = useState<StudentData | null>(null);

  useEffect(() => {
    if (studentResults && studentResults.length > 0) {
      setDisplayedStudent(studentResults[0]);
    }
  }, [studentResults]);

  // 드롭다운에서 다른 학생을 선택했을 때 상태를 변경하는 핸들러
  const handleStudentSelect = (studentName: string) => {
    const student = studentResults.find((s) => s.studentName === studentName);
    if (student) {
      setDisplayedStudent(student);
    }
  };

  // 표시할 학생 데이터가 없을 경우
  if (!displayedStudent) {
    return <div className="text-center text-gray-500">표시할 학생 데이터가 없습니다.</div>;
  }

  // 2. 조건부 렌더링을 제거하고, 항상 상세 보기(두 패널 레이아웃)를 렌더링합니다.
  return (
    <div className="flex flex-col lg:flex-row gap-6 items-start">
      {/* 왼쪽 패널 */}
      <div className="w-full lg:w-auto flex-shrink-0">
        <BoardReportStudent
          studentName={displayedStudent.studentName}
          correctAnswers={displayedStudent.correctAnswers}
          students={studentResults.map((s) => s.studentName)}
          onStudentSelect={handleStudentSelect}
        />
      </div>

      {/* 오른쪽 패널 */}
      <div className="flex-1">
        <BoardReportStudentSubmission
          title={`${displayedStudent.studentName}의 제출 내역`}
          submissions={displayedStudent.submissions}
        />
      </div>
    </div>
  );
};

export default StudentReportView;
