import React from 'react';

interface ProblemResult {
  id: string;
  name: string;
  correctRate: number;
  correctCount: number;
  totalStudents: number;
  category: string;
}

const mockProblemData: ProblemResult[] = [
  {
    id: 'A',
    name: '문제 A',
    correctRate: 50,
    correctCount: 2,
    totalStudents: 4,
    category: '카테고리',
  },
  {
    id: 'B',
    name: '문제 B',
    correctRate: 75,
    correctCount: 3,
    totalStudents: 4,
    category: '카테고리',
  },
  {
    id: 'C',
    name: '문제 C',
    correctRate: 25,
    correctCount: 1,
    totalStudents: 4,
    category: '카테고리',
  },
  {
    id: 'D',
    name: '문제 D',
    correctRate: 100,
    correctCount: 4,
    totalStudents: 4,
    category: '카테고리',
  },
];

const ProblemAnalysisPanel: React.FC = () => {
  return (
    <div className="w-[599px] h-[721px] flex-shrink-0 relative">
      <div className="w-[599px] h-[721px] flex-shrink-0 rounded-2xl border border-slate-600 bg-slate-800 shadow-[0px_8px_30px_0px_rgba(0,0,0,0.30)] backdrop-blur-[2px] absolute left-0 top-0"></div>

      {/* Title */}
      <div className="text-white font-inter text-xl font-bold leading-[30px] absolute left-[30px] top-[25px]">
        문제별 정답률
      </div>

      {/* Problem results */}
      <div className="absolute left-[25px] top-[79px] space-y-5">
        {mockProblemData.map((problem, index) => (
          <div key={problem.id} className="w-[549px] h-[120px] flex-shrink-0 relative">
            <div className="w-[550px] h-[120px] flex-shrink-0 rounded-xl bg-[#221F34] absolute left-0 top-0"></div>

            {/* Problem info */}
            <div className="w-[517px] h-[59px] flex-shrink-0 absolute left-4 top-4">
              <div className="text-white font-inter text-base font-semibold leading-6 absolute left-0 top-0">
                {problem.name}
              </div>
              <div className="text-blue-500 font-inter text-sm font-semibold leading-[21px] absolute right-0 top-[2px]">
                {problem.correctRate}%
              </div>

              {/* Progress bar background */}
              <div className="w-[517px] h-4 flex-shrink-0 rounded-full bg-slate-600 absolute left-0 top-[43px]"></div>

              {/* Progress bar fill */}
              <div
                className="h-4 flex-shrink-0 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 absolute left-0 top-[43px]"
                style={{ width: `${(problem.correctRate / 100) * 517}px` }}
              ></div>
            </div>

            {/* Category badge */}
            <div className="w-[75px] h-[19px] flex-shrink-0 absolute left-[69px] top-[18px]">
              <div className="w-[75px] h-[19px] flex-shrink-0 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 absolute left-0 top-0"></div>
              <div className="text-slate-50 font-inter text-xs font-semibold leading-4 absolute left-[15px] top-[2px]">
                {problem.category}
              </div>
            </div>

            {/* Correct count */}
            <div className="text-slate-400 font-inter text-sm font-normal leading-[21px] absolute right-4 bottom-4">
              정답 인원: {problem.correctCount}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProblemAnalysisPanel;
