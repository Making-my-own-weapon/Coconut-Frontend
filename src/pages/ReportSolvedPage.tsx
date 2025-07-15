import { LogOut, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import ReportLayout from '../components/report/ReportLayout';
import React, { useState } from 'react';
import { BoardReportSolved } from '../components/report';

// --- 가짜 데이터 및 타입 정의 ---
interface ProblemData {
  title: string;
  timeLimit: string;
  memoryLimit: string;
  submissions: string;
  solvers: string;
  category: 'green' | 'orange' | '';
}
interface StudentResult {
  name: string;
  result: string;
  memory: string;
  time: string;
  solvingTime: string;
  status: 'pass' | 'runtime-error' | 'timeout' | 'memory-exceeded';
}
const problems: ProblemData[] = [
  {
    title: '슬라이딩 윈도우 중앙 값',
    timeLimit: '1 초',
    memoryLimit: '512 MB',
    submissions: '1673 회',
    solvers: '4 명',
    category: '',
  },
  {
    title: '이상한 알고리즘',
    timeLimit: '1 초',
    memoryLimit: '512 MB',
    submissions: '1673 회',
    solvers: '4 명',
    category: '',
  },
];
const studentResults: StudentResult[] = [
  {
    name: '김대원',
    result: '통과',
    memory: '128MB',
    time: '0.5초',
    solvingTime: '22분 31초',
    status: 'pass',
  },
  {
    name: '배재준',
    result: '런타임 에러',
    memory: '128MB',
    time: '0.5초',
    solvingTime: '92분 03초',
    status: 'runtime-error',
  },
];

const ReportSolvedPage: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();

  // 👇 버튼에 필요한 함수와 변수를 임시로 정의합니다.
  const isLoading = false;
  const handleLeaveRoom = () => {
    if (roomId) navigate('/join');
  };

  const [viewingStudent, setViewingStudent] = useState<StudentResult | null>(null);
  const actionButtons = (
    <>
      <button className="flex items-center justify-center gap-2 px-3 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-md text-white font-medium">
        <Save className="w-5 h-5" /> 리포트 저장
      </button>
      <button
        onClick={handleLeaveRoom}
        disabled={isLoading}
        className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-800 rounded-md text-white font-medium disabled:opacity-50"
      >
        <LogOut className="w-5 h-5" /> 수업 종료
      </button>
    </>
  );

  return (
    <ReportLayout activeTab="problem" actions={actionButtons}>
      {/* --- 페이지의 실제 컨텐츠 --- */}
      <main className="flex flex-col xl:flex-row lg:gap-6">
        {/* 왼쪽 패널 - 문제 분석 */}
        <div className="w-full xl:w-[470px] flex-shrink-0 bg-slate-800 rounded-lg shadow-lg p-6 lg:p-7 h-[656px] flex flex-col">
          <h2 className="text-white text-2xl font-bold mb-6">문제</h2>
          <div className="space-y-4">
            {problems.map((problem, index) => (
              <BoardReportSolved
                key={index}
                title={problem.title}
                timeLimit={problem.timeLimit}
                memoryLimit={problem.memoryLimit}
                submissions={problem.submissions}
                correctAnswers={problem.solvers}
                category={problem.category}
              />
            ))}
          </div>
        </div>

        {/* 오른쪽 패널 - 학생 코드 */}
        <div className="flex-1 bg-slate-800 rounded-lg shadow-lg p-6 lg:p-7">
          {viewingStudent ? (
            // --- 2. 학생을 선택했을 때 보여줄 화면 ---
            <div>
              <div className="flex justify-between mb-4">
                <h2 className="text-white text-2xl font-bold">{viewingStudent.name}의 제출 코드</h2>
                <button
                  onClick={() => setViewingStudent(null)}
                  className="mb-4 text-blue-400 hover:underline"
                >
                  &lt; 목록으로 돌아가기
                </button>
              </div>
              <div className="bg-black p-4 rounded-md">
                <pre>
                  <code>ㅁㄴㅇ</code>
                </pre>
              </div>
            </div>
          ) : (
            // --- 1. 기본적으로 보여줄 학생 목록 ---
            <>
              <h2 className="text-white text-2xl font-bold mb-6">학생별 제출 현황</h2>
              <div className="space-y-4">
                {studentResults.map((student, index) => (
                  <div
                    key={index}
                    // 👇 각 항목을 클릭하면 viewingStudent 상태가 변경됩니다.
                    onClick={() => setViewingStudent(student)}
                    className="bg-[#221F34] rounded-xl min-h-[122px] flex items-center p-4 cursor-pointer hover:bg-opacity-80"
                  >
                    <h3>{student.name}</h3>
                    {/* ... 학생 1명의 결과 내용 ... */}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </ReportLayout>
  );
};

export default ReportSolvedPage;
