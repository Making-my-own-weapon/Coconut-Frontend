import React, { useState } from 'react';
import { Check } from 'lucide-react';

// 이 컴포넌트에서만 사용할 임시 타입 및 데이터
interface ProblemData {
  title: string;
  category: 'green' | 'orange' | '';
  timeLimit: number;
  memoryLimit: number;
  submissions: number;
  solvers: number;
}
interface StudentResult {
  name: string;
  status: 'pass' | 'runtime-error' | 'timeout' | 'memory-exceeded';
  memory: number;
  time: number;
  solvingTime: number;
  result: string;
}
const problems: ProblemData[] = [
  {
    title: '슬라이딩 윈도우 중앙 값',
    category: 'green',
    timeLimit: 1,
    memoryLimit: 1,
    submissions: 1,
    solvers: 1,
  },
  {
    title: '이상한 알고리즘',
    category: 'orange',
    timeLimit: 1,
    memoryLimit: 1,
    submissions: 1,
    solvers: 1,
  },
];
const studentResults: StudentResult[] = [
  { name: '김대원', status: 'pass', memory: 1, time: 1, solvingTime: 1, result: 'PASS' },
  {
    name: '배재준',
    status: 'runtime-error',
    memory: 1,
    time: 1,
    solvingTime: 1,
    result: 'runtime-error',
  },
];

const ProblemReportView: React.FC = () => {
  const [viewingStudent, setViewingStudent] = useState<StudentResult | null>(null);

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      {/* 왼쪽 패널 - 문제 분석 */}
      <div className="w-full xl:w-[470px] flex-shrink-0 bg-slate-800 border-slate-600 rounded-lg shadow-lg p-6 lg:p-7 h-[656px] flex flex-col">
        <h2 className="text-white text-2xl font-bold mb-6">문제별 분석</h2>
        <div className="space-y-4 overflow-y-auto">
          {problems.map((problem, index) => (
            <div key={index} className="bg-[#221F34] rounded-xl p-4 min-h-[120px]">
              <div className="w-full">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                  <h3 className="text-white text-lg font-semibold mb-2 sm:mb-0">{problem.title}</h3>
                  <div
                    className={`w-auto px-3 h-[19px] rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 ${
                      problem.category === 'green'
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-700'
                        : 'bg-gradient-to-r from-amber-500 to-amber-700'
                    }`}
                  ></div>
                </div>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-white text-base font-semibold">{problem.timeLimit}</p>
                    <p className="text-slate-400 text-sm">시간 제한</p>
                  </div>
                  <div>
                    <p className="text-white text-base font-semibold">{problem.memoryLimit}</p>
                    <p className="text-slate-400 text-sm">메모리 제한</p>
                  </div>
                  <div>
                    <p className="text-white text-base font-semibold">{problem.submissions}</p>
                    <p className="text-slate-400 text-sm">제출</p>
                  </div>
                  <div>
                    <p className="text-white text-base font-semibold">{problem.solvers}</p>
                    <p className="text-slate-400 text-sm">정답 인원</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 오른쪽 패널 - 학생 코드 */}
      <div className="flex-1 bg-slate-800 border-slate-600 rounded-lg shadow-lg p-6 h-[656px] flex flex-col">
        {viewingStudent ? (
          <div>
            <div className="flex justify-between">
              <h2 className="text-white text-2xl font-bold mb-7">
                {viewingStudent.name}의 제출 코드
              </h2>
              <button
                onClick={() => setViewingStudent(null)}
                className="mb-4 text-blue-400 hover:underline"
              >
                &lt; 목록으로 돌아가기
              </button>
            </div>
            <div className="bg-black p-4 rounded-md overflow-y-auto">
              <pre>
                <code>코드 에디터 영역</code>
              </pre>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-white text-2xl font-bold mb-7">학생 제출</h2>
            <div className="space-y-4 overflow-y-auto">
              {studentResults.map((student, index) => (
                <div
                  key={index}
                  onClick={() => setViewingStudent(student)}
                  className="bg-[#221F34] rounded-xl min-h-[122px] flex items-center p-4 cursor-pointer hover:bg-opacity-80"
                >
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full items-center text-center">
                    <div>
                      <p className="text-slate-400 text-sm mb-1">참가자</p>
                      <p className="text-white text-lg font-bold">{student.name}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">결과</p>
                      <p className="text-white text-lg font-bold flex items-center justify-center gap-2">
                        <span>{student.result}</span>
                        {student.status === 'pass' && <Check className="w-5 h-5 text-green-400" />}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">메모리</p>
                      <p className="text-white text-lg font-bold">{student.memory}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm mb-1">시간</p>
                      <p className="text-white text-lg font-bold">{student.time}</p>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                      <p className="text-slate-400 text-sm mb-1">풀이시간</p>
                      <p className="text-white text-lg font-bold">{student.solvingTime}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProblemReportView;
