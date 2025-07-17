import React, { useState } from 'react';
import CardReportStudent from './CardReportStudent';
import BoardReportStudent from './BoardReportStudent';
import BoardReportStudentSubmission from './BoardReportStudentSubmission';

// --- 임시 데이터 타입 및 데이터 ---
interface StudentData {
  studentName: string;
  correctAnswers: number;
  submissions: {
    id: number;
    submissionNumber: number;
    status: 'passed' | 'runtime_error' | 'failed';
    memory: string;
    executionTime: string;
  }[];
}

interface StudentReportViewProps {
  studentResults: StudentData[];
  totalProblems: number;
}

const StudentReportView: React.FC<StudentReportViewProps> = ({ studentResults, totalProblems }) => {
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);

  // 👇 함수를 컴포넌트 안으로 옮겨서 props에 접근할 수 있게 합니다.
  const handleStudentSelect = (studentName: string) => {
    const student = studentResults.find((s) => s.studentName === studentName);
    if (student) {
      setSelectedStudent(student);
    }
  };

  return (
    <div>
      {selectedStudent ? (
        // --- 학생 선택 후 (상세 보기) ---
        <div>
          <div className="flex flex-col lg:flex-row gap-6 items-start mt-4">
            {/* 👇 왼쪽 패널 너비를 고정합니다. */}
            <div className="w-full lg:w-[470px] flex-shrink-0">
              <BoardReportStudent
                studentName={selectedStudent.studentName}
                correctAnswers={selectedStudent.correctAnswers}
                students={studentResults.map((s) => s.studentName)}
                onStudentSelect={(name) => {
                  const student = studentResults.find((s) => s.studentName === name);
                  if (student) setSelectedStudent(student);
                }}
              />
            </div>

            <div className="flex-1">
              <BoardReportStudentSubmission
                title={`${selectedStudent.studentName}의 제출 내역`}
                submissions={selectedStudent.submissions}
              />
            </div>
          </div>
        </div>
      ) : (
        // --- 학생 선택 전 (목록 보기) ---
        // 학생 목록 가운데 정렬
        <div className="flex flex-wrap justify-center gap-8">
          {studentResults.map((student) => (
            <div
              key={student.studentName}
              onClick={() => setSelectedStudent(student)}
              className="cursor-pointer"
            >
              <CardReportStudent
                studentName={student.studentName}
                correctAnswers={student.correctAnswers}
                totalProblems={totalProblems}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentReportView;
