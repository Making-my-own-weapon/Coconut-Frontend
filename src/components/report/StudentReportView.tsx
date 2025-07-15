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
}

// 👇 submissions 배열에 가짜 데이터를 추가합니다.
const mockStudents: StudentData[] = [
  {
    studentName: '김대원',
    correctAnswers: 8,
    submissions: [
      { id: 1, submissionNumber: 1, status: 'passed', memory: '128KB', executionTime: '0.5ms' },
      { id: 2, submissionNumber: 2, status: 'passed', memory: '132KB', executionTime: '0.4ms' },
    ],
  },
  {
    studentName: '정소영',
    correctAnswers: 6,
    submissions: [
      { id: 1, submissionNumber: 1, status: 'passed', memory: '128KB', executionTime: '0.5ms' },
      { id: 2, submissionNumber: 2, status: 'passed', memory: '132KB', executionTime: '0.4ms' },
    ],
  },
  {
    studentName: '박지성',
    correctAnswers: 8,
    submissions: [
      { id: 1, submissionNumber: 1, status: 'passed', memory: '128KB', executionTime: '0.5ms' },
      { id: 2, submissionNumber: 2, status: 'passed', memory: '132KB', executionTime: '0.4ms' },
    ],
  },
  {
    studentName: '배재준',
    correctAnswers: 10,
    submissions: [
      {
        id: 3,
        submissionNumber: 1,
        status: 'runtime_error',
        memory: '256KB',
        executionTime: '1.2ms',
      },
      { id: 4, submissionNumber: 2, status: 'passed', memory: '260KB', executionTime: '1.1ms' },
    ],
  },
];

const StudentReportView: React.FC<StudentReportViewProps> = ({ studentResults }) => {
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
                students={mockStudents.map((s) => s.studentName)}
                onStudentSelect={(name) => {
                  const student = mockStudents.find((s) => s.studentName === name);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockStudents.map((student) => (
            <div
              key={student.studentName}
              onClick={() => setSelectedStudent(student)}
              className="cursor-pointer"
            >
              <CardReportStudent
                studentName={student.studentName}
                correctAnswers={student.correctAnswers}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentReportView;
