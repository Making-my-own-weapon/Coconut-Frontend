import React, { useState } from 'react';

interface ProblemSubmission {
  problemId: number;
  problemTitle: string;
  status: 'passed' | 'failed' | 'not_submitted';
  submissionCount: number;
  lastSubmissionDate: Date;
  submissions: any[];
}

export interface BoardReportStudentProps {
  studentName?: string;
  correctAnswers?: number;
  problemTitle?: string;
  status?: 'passed' | 'failed' | 'pending';
  onStudentSelect?: (studentName: string) => void;
  students?: string[];
  className?: string;
  // 새로 추가된 props
  problemSubmissions?: ProblemSubmission[];
  onProblemSelect?: (problem: ProblemSubmission) => void;
  selectedProblem?: ProblemSubmission | null;
  totalProblems?: number;
  solvedProblems?: number;
  isStudentView?: boolean; // 학생용 뷰인지 여부 (드롭다운 숨김용)
}

const BoardReportStudent: React.FC<BoardReportStudentProps> = ({
  studentName,
  problemTitle = '이상한 알고리즘',
  status = 'passed',
  onStudentSelect,
  students = [],
  className = '',
  problemSubmissions = [],
  onProblemSelect,
  selectedProblem,
  totalProblems = 0,
  solvedProblems = 0,
  isStudentView = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(studentName || '');

  const handleStudentSelect = (student: string) => {
    setSelectedStudent(student);
    setIsDropdownOpen(false);
    onStudentSelect?.(student);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'passed':
        return '통과';
      case 'failed':
        return '실패';
      case 'not_submitted':
        return '미제출';
      case 'pending':
        return '대기중';
      default:
        return '미제출';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return '#5DFFA3';
      case 'failed':
        return '#FF5D5D';
      case 'not_submitted':
        return '#94A3B8';
      case 'pending':
        return '#FFB800';
      default:
        return '#94A3B8';
    }
  };

  return (
    <div
      className={`w-full max-w-[470px] h-[656px] bg-slate-800 border border-slate-600 rounded-2xl p-6 flex flex-col ${className}`}
    >
      {/* 학생 선택 드롭다운 - 학생용 뷰에서는 숨김 */}
      {!isStudentView && (
        <div className="relative w-40 mb-5">
          <div
            className="w-full h-10 bg-slate-700 border border-slate-600 rounded-xl grid grid-cols-[1fr_auto] items-center gap-2 px-4 cursor-pointer"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="text-white font-medium truncate">
              {selectedStudent || '학생 선택'}
            </span>
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
          {isDropdownOpen && (
            <div className="absolute top-full mt-2 w-full bg-slate-700 border border-slate-600 rounded-xl z-10 max-h-40 overflow-y-auto">
              {students
                .filter((student) => student !== selectedStudent) // 현재 선택된 학생 제외
                .map((student, index) => (
                  <div
                    key={index}
                    onClick={() => handleStudentSelect(student)}
                    className="px-4 py-3 hover:bg-slate-600 cursor-pointer text-white first:rounded-t-xl last:rounded-b-xl"
                  >
                    {student}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* 학생용 뷰에서는 학생 이름만 표시 */}
      {isStudentView && (
        <div className="mb-5">
          <h2 className="text-white text-xl font-bold">{selectedStudent}</h2>
          <p className="text-slate-400 text-sm mt-1">
            해결한 문제: {solvedProblems}/{totalProblems}
          </p>
        </div>
      )}

      {/* 문제 목록 */}
      <div className="flex-1 overflow-hidden">
        <h3 className="text-white text-lg font-bold mb-4">문제 목록</h3>
        <div className="space-y-3 overflow-y-auto h-full">
          {problemSubmissions.map((problem) => (
            <div
              key={problem.problemId}
              onClick={() => onProblemSelect?.(problem)}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                selectedProblem?.problemId === problem.problemId
                  ? 'bg-blue-600 border-2 border-blue-400'
                  : 'bg-[#221F34] hover:bg-[#2A2640] border border-slate-600'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <h4 className="text-white text-base font-semibold mb-1 truncate">
                    {problem.problemTitle}
                  </h4>
                  <div className="text-sm text-slate-400">제출 {problem.submissionCount}회</div>
                </div>
                <div className="ml-3 text-center">
                  <span
                    className="text-sm font-bold px-2 py-1 rounded"
                    style={{
                      color: getStatusColor(problem.status),
                      backgroundColor: `${getStatusColor(problem.status)}20`,
                    }}
                  >
                    {getStatusText(problem.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {problemSubmissions.length === 0 && (
            <div className="text-center text-slate-400 py-8">
              <p>문제 데이터를 불러오는 중...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardReportStudent;
