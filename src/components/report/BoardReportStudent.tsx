import React, { useState } from 'react';

export interface BoardReportStudentProps {
  studentName?: string;
  correctAnswers?: number;
  problemTitle?: string;
  status?: 'passed' | 'failed' | 'pending';
  onStudentSelect?: (studentName: string) => void;
  students?: string[];
  className?: string;
}

const BoardReportStudent: React.FC<BoardReportStudentProps> = ({
  studentName,
  problemTitle = '이상한 알고리즘',
  status = 'passed',
  onStudentSelect,
  students = [],
  className = '',
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(studentName || '');

  const handleStudentSelect = (student: string) => {
    setSelectedStudent(student);
    setIsDropdownOpen(false);
    onStudentSelect?.(student);
  };

  const getStatusText = () => {
    switch (status) {
      case 'passed':
        return '통과';
      case 'failed':
        return '실패';
      case 'pending':
        return '대기중';
      default:
        return '통과';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'passed':
        return '#5DFFA3';
      case 'failed':
        return '#FF5D5D';
      case 'pending':
        return '#FFB800';
      default:
        return '#5DFFA3';
    }
  };

  return (
    <div
      className={`w-full max-w-[470px] h-[656px] bg-slate-800 border border-slate-600 rounded-2xl p-6 flex flex-col ${className}`}
    >
      {/* 학생 선택 드롭다운 */}
      <div className="relative w-40 mb-5">
        <div
          className="w-full h-10 bg-slate-700 border border-slate-600 rounded-xl grid grid-cols-[1fr_auto] items-center gap-2 px-4 cursor-pointer"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          {/* 텍스트가 넘치면 말줄임표 처리됩니다. */}
          <span className="text-white font-medium truncate">{selectedStudent || '학생 선택'}</span>
          {/* 아이콘은 자기 크기만큼만 차지합니다. */}
          <svg className="w-5 h-5">{/* ... */}</svg>
        </div>
        {isDropdownOpen && (
          <div className="absolute top-full mt-2 w-full bg-slate-700 border border-slate-600 rounded-xl z-10">
            {students.map((student, index) => (
              <div
                key={index}
                onClick={() => handleStudentSelect(student)}
                className="px-4 py-3 hover:bg-slate-600 cursor-pointer text-white"
              >
                {student}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 문제 상태 카드 */}
      <div className="w-full bg-[#221F34] rounded-xl p-4 gap-4">
        <div className="flex justify-between">
          <div className="text-white text-xl font-bold">
            <h3>{problemTitle}</h3>
          </div>
          <div>
            <span className="text-xl" style={{ color: getStatusColor() }}>
              {getStatusText()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardReportStudent;
