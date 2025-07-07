import React from 'react';
// '../types/student' 대신 '../contexts/RoomContext' 에서 타입을 가져옵니다.
import type { Student } from '../../../store/teacherStore';

const GridCard: React.FC<{
  student: Student;
  className?: string;
  selectedStudentId?: number | null;
  onStudentSelect?: (studentId: number) => void;
}> = ({ student, className = '', selectedStudentId, onStudentSelect }) => {
  const { name, progress, timeComplexity, spaceComplexity, testsPassed, totalTests, isOnline } =
    student;
  const progressBarWidth = `${progress}%`;
  const allTestsPassed = testsPassed === totalTests;
  const isSelected = selectedStudentId === student.userId;

  const handleCardClick = (studentId: number) => {
    console.log('학생 선택:', studentId);
    if (onStudentSelect) {
      onStudentSelect(studentId);
    }
  };

  return (
    <div
      className={`w-full max-w-[312px] h-[230px] rounded-lg border border-slate-600 bg-slate-800 shadow-sm cursor-pointer transition-all hover:border-blue-500 ${
        isSelected ? 'border-blue-500 bg-slate-700' : ''
      } ${className}`}
      onClick={() => handleCardClick(student.userId)}
    >
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 21V19C19 16.8783 17.1217 15 15 15H9C6.87827 15 5 16.8783 5 19V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-white font-semibold text-base">{name}</span>
        </div>
        {isOnline && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/20 text-green-400">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 8.82C4.75011 6.36025 8.31034 5.00037 12 5.00037C15.6897 5.00037 19.2499 6.36025 22 8.82"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5 12.8591C6.86929 11.0268 9.38247 10.0005 12 10.0005C14.6175 10.0005 17.1307 11.0268 19 12.8591"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-xs font-medium">온라인</span>
          </div>
        )}
      </div>
      {/* 바디 */}
      <div className="p-4 space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-slate-300 text-sm">진행률</span>
            <span className="text-white text-sm font-medium">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-600 rounded-full">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: progressBarWidth }} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-700 p-2 rounded">
            <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 6V12L16 14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-xs">시간</span>
            </div>
            <span className="text-white font-mono text-xs">{timeComplexity}</span>
          </div>
          <div className="bg-slate-700 p-2 rounded">
            <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 8C16.9706 8 21 6.65685 21 5C21 3.34315 16.9706 2 12 2C7.02944 2 3 3.34315 3 5C3 6.65685 7.02944 8 12 8Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 5V19C3 19.7956 3.94821 20.5587 5.63604 21.1213C7.32387 21.6839 9.61305 22 12 22C14.3869 22 16.6761 21.6839 18.364 21.1213C20.0518 20.5587 21 19.7956 21 19V5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 12C3 12.7956 3.94821 13.5587 5.63604 14.1213C7.32387 14.6839 9.61305 15 12 15C14.3869 15 16.6761 14.6839 18.364 14.1213C20.0518 13.5587 21 12.7956 21 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-xs">공간</span>
            </div>
            <span className="text-white font-mono text-xs">{spaceComplexity}</span>
          </div>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-400">테스트</span>
          <span className={`font-medium ${allTestsPassed ? 'text-green-400' : 'text-red-400'}`}>
            {allTestsPassed ? '✓' : '✗'} {testsPassed} / {totalTests}
          </span>
        </div>
      </div>
    </div>
  );
};

export default GridCard;
