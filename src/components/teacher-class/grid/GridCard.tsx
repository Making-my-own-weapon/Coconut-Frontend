import React from 'react';
// '../types/student' 대신 '../contexts/RoomContext' 에서 타입을 가져옵니다.
import type { Student } from '../../../store/teacherStore';
import { useTeacherStore } from '../../../store/teacherStore';
import { useState } from 'react';

const GridCard: React.FC<{
  student: Student;
  className?: string;
  selectedStudentId?: number | null;
  onStudentSelect?: (studentId: number) => void;
  isConnecting?: boolean;
}> = ({ student, className = '', selectedStudentId, onStudentSelect, isConnecting = false }) => {
  const { name, progress, timeComplexity, spaceComplexity, testsPassed, totalTests, isOnline } =
    student;
  const progressBarWidth = `${progress}%`;
  const allTestsPassed = testsPassed === totalTests;
  const isSelected = selectedStudentId === student.userId;

  const { studentMemos, setStudentMemo, studentWrongProblems, studentCurrentProblems, problems } =
    useTeacherStore();

  // 메모 입력 상태
  const [memo, setMemo] = useState(studentMemos[student.userId] || '');
  const handleMemoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMemo(e.target.value);
  };
  const handleMemoBlur = () => {
    setStudentMemo(student.userId, memo);
  };

  // 현재 문제
  const currentProblemId = studentCurrentProblems[student.userId];
  const currentProblem = problems.find((p) => p.problemId === currentProblemId);
  console.log(
    '[GridCard] userId:',
    student.userId,
    'currentProblemId:',
    currentProblemId,
    'currentProblem:',
    currentProblem,
  );

  // 오답(틀린 문제)
  const wrongProblems = studentWrongProblems[student.userId] || [];
  const wrongProblemObjs = problems.filter((p) => wrongProblems.includes(p.problemId));

  const handleCardClick = (studentId: number) => {
    console.log('학생 선택:', studentId);
    if (onStudentSelect) {
      onStudentSelect(studentId);
    }
  };

  return (
    <div
      className={`w-full max-w-[560px] h-[260px] rounded-3xl border-2 border-slate-700 bg-slate-800 shadow-2xl backdrop-blur-md cursor-pointer transition-all duration-200 hover:border-blue-400 hover:shadow-blue-500/30 hover:scale-[1.035] flex flex-row overflow-hidden ring-1 ring-slate-900/40 ${
        isSelected ? 'border-blue-400 ring-2 ring-blue-400 bg-slate-700/95' : ''
      } ${className}`}
      style={{ boxShadow: '0 8px 32px 0 rgba(97, 94, 155, 0.25), 0 1.5px 8px 0rgb(0, 0, 0)' }}
      onClick={() => handleCardClick(student.userId)}
    >
      {/* 왼쪽: 이름/온라인/메모 (세로 중앙 정렬) */}
      <div className="flex flex-col items-center justify-center w-72 bg-slate-900/80 p-6 h-full">
        <div className="flex flex-col items-center gap-2 w-full">
          <span className="text-white font-bold text-lg text-center w-full truncate">{name}</span>
          {isOnline && (
            <span className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
              ● 온라인
            </span>
          )}
        </div>
        <textarea
          className="w-[320px] max-w-full h-48 resize-none rounded-md bg-slate-800/80 text-slate-200 p-4 text-base mt-6 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
          placeholder="메모를 입력하세요"
          value={memo}
          onChange={handleMemoChange}
          onBlur={handleMemoBlur}
          onClick={(e) => e.stopPropagation()}
          onFocus={(e) => e.stopPropagation()}
        />
      </div>
      {/* 오른쪽: 문제 정보/진행률 (문제 정보 세로 배열, 이름과 윗라인 맞춤) */}
      <div className="flex-1 flex flex-col justify-center p-4 gap-4 h-full w-full min-w-0">
        <div className="flex flex-row items-start gap-12 h-full">
          <div className="flex flex-col gap-6 min-w-[160px] justify-center h-full">
            <div>
              <span className="text-slate-400 text-xs font-medium">풀고 있는 문제</span>
              <div className="text-white font-semibold text-base mt-1">
                {currentProblem ? `${currentProblem.title}` : '없음'}
              </div>
            </div>
            <div>
              <span className="text-slate-400 text-xs font-medium">틀린 문제</span>
              <div className="flex gap-1 flex-wrap mt-1">
                {wrongProblemObjs.length === 0 ? (
                  <span className="text-slate-500 text-xs">없음</span>
                ) : (
                  wrongProblemObjs.slice(0, 3).map((p) => (
                    <span
                      key={p.problemId}
                      className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold"
                    >
                      {p.problemId}번
                    </span>
                  ))
                )}
                {wrongProblemObjs.length > 3 && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-600 text-slate-300 text-xs font-semibold">
                    +{wrongProblemObjs.length - 3}
                  </span>
                )}
              </div>
            </div>
            {/* 진행률: 컬러풀한 일자 progress bar + 바 중앙 숫자 오버레이 */}
            <div className="flex flex-col items-start mt-4 w-full min-w-0">
              <div className="flex flex-row justify-between items-end w-full mb-1">
                <span className="text-slate-400 text-xs font-medium">진행률</span>
                <span className="text-slate-400 text-xs font-medium select-none">
                  {student.testsPassed} / {problems.length}
                </span>
              </div>
              <div className="relative w-full h-8 bg-slate-700 rounded-full overflow-hidden shadow-inner min-w-0">
                <div
                  className="absolute top-0 left-0 h-full rounded-full transition-all"
                  style={{
                    width: `${problems.length > 0 ? (student.testsPassed / problems.length) * 100 : 0}%`,
                    background: 'linear-gradient(90deg, #3b82f6 0%, #06d6a0 50%, #22d3ee 100%)',
                    boxShadow: '0 0 12px #22d3ee99',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GridCard;
