import React from 'react';

export interface BoardReportSolvedProps {
  title: string;
  timeLimit: string;
  memoryLimit: string;
  submissions: string;
  correctAnswers: string;
  category?: string;
  className?: string;
}

const BoardReportSolved: React.FC<BoardReportSolvedProps> = ({
  title,
  timeLimit,
  memoryLimit,
  submissions,
  correctAnswers,
  category = '',
  className = '',
}) => {
  return (
    <div
      className={`inline-flex h-[120px] p-4 justify-center items-center flex-shrink-0 rounded-lg bg-[#221F34] relative w-full max-w-[421px] ${className}`}
    >
      <div className="w-full h-[88px] relative">
        {/* Title */}
        <div className="w-full max-w-[291px] h-6 flex-shrink-0 absolute left-0 top-0">
          <h3 className="text-white font-inter text-xl font-semibold leading-6 truncate">
            {title}
          </h3>
        </div>

        {/* Category Badge */}
        <div className="w-[75px] h-[19px] flex-shrink-0 absolute right-0 top-0.5">
          <div className="w-full h-full flex-shrink-0 rounded-full bg-gradient-to-r from-[#F39B0A] to-[#DA7806] relative">
            <div className="w-[45px] h-4 flex-shrink-0 absolute left-[15px] top-0.5">
              <span className="text-[#F8FAFC] font-inter text-xs font-semibold leading-4">
                {category}
              </span>
            </div>
          </div>
        </div>

        {/* Metrics & Labels Grid */}
        <div className="absolute left-0 top-[38px] w-full grid grid-cols-4 gap-4 text-center">
          {/* 시간 제한 그룹 */}
          <div>
            <p className="text-white font-inter text-base font-semibold">{timeLimit}</p>
            <p className="text-slate-400 font-inter text-sm">시간 제한</p>
          </div>

          {/* 메모리 제한 그룹 */}
          <div>
            <p className="text-white font-inter text-base font-semibold">{memoryLimit}</p>
            <p className="text-slate-400 font-inter text-sm">메모리 제한</p>
          </div>

          {/* 제출 그룹 */}
          <div>
            <p className="text-white font-inter text-base font-semibold">{submissions}</p>
            <p className="text-slate-400 font-inter text-sm">제출</p>
          </div>

          {/* 정답 인원 그룹 */}
          <div>
            <p className="text-white font-inter text-base font-semibold">{correctAnswers}</p>
            <p className="text-slate-400 font-inter text-sm">정답 인원</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardReportSolved;
