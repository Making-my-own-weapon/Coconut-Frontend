import React from 'react';

interface StudentResult {
  id: string;
  name: string;
  rank: number;
  correctRate: number;
  correctCount: number;
  totalProblems: number;
}

const mockStudentData: StudentResult[] = [
  {
    id: '1',
    name: '박지성',
    rank: 1,
    correctRate: 25,
    correctCount: 1,
    totalProblems: 4,
  },
  {
    id: '2',
    name: '김민수',
    rank: 2,
    correctRate: 50,
    correctCount: 2,
    totalProblems: 4,
  },
  {
    id: '3',
    name: '이영희',
    rank: 3,
    correctRate: 75,
    correctCount: 3,
    totalProblems: 4,
  },
  {
    id: '4',
    name: '정철수',
    rank: 4,
    correctRate: 100,
    correctCount: 4,
    totalProblems: 4,
  },
];

const StudentPerformancePanel: React.FC = () => {
  return (
    <div className="w-[599px] h-[721px] flex-shrink-0 relative">
      <div className="w-[599px] h-[721px] flex-shrink-0 rounded-2xl border border-slate-600 bg-slate-800 shadow-[0px_8px_30px_0px_rgba(0,0,0,0.30)] backdrop-blur-[2px] absolute left-0 top-0"></div>

      {/* Title */}
      <div className="text-white font-inter text-xl font-bold leading-[30px] absolute left-8 top-[27px]">
        학생별 성과
      </div>

      {/* Student results */}
      <div className="absolute left-6 top-[81px] space-y-5">
        {mockStudentData.map((student) => (
          <div key={student.id} className="w-[549px] h-[114px] flex-shrink-0 relative">
            <div className="w-[549px] h-[114px] flex-shrink-0 rounded-xl bg-slate-600 absolute left-0 top-0"></div>

            {/* Student info */}
            <div className="w-[514px] h-[86px] flex-shrink-0 absolute left-5 top-[17px]">
              {/* Rank */}
              <div className="text-blue-500 text-right font-inter text-lg font-bold leading-[27px] absolute right-0 top-0">
                #{student.rank}
              </div>

              {/* Name */}
              <div className="text-white font-inter text-base font-semibold leading-6 absolute left-0 top-0">
                {student.name}
              </div>

              {/* Correct rate */}
              <div className="text-slate-400 font-inter text-sm font-normal leading-[21px] absolute left-0 bottom-0">
                정답률: {student.correctRate}%
              </div>

              {/* Correct count */}
              <div className="text-slate-400 font-inter text-sm font-normal leading-[21px] absolute right-0 bottom-0">
                정답: {student.correctCount}/{student.totalProblems}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-[517px] h-4 flex-shrink-0 absolute left-[17px] top-[57px]">
              {/* Background */}
              <div className="w-[517px] h-4 flex-shrink-0 rounded-full bg-slate-600 absolute left-0 top-0"></div>
              {/* Fill */}
              <div
                className="h-4 flex-shrink-0 rounded-full bg-gradient-to-r from-emerald-700 to-emerald-500 absolute left-0 top-0"
                style={{ width: `${(student.correctRate / 100) * 517}px` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentPerformancePanel;
