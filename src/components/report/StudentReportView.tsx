import React, { useState } from 'react';
import { useReportStore } from '../../store/reportStore';
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

interface ProblemSubmission {
  problemId: number;
  problemTitle: string;
  status: 'passed' | 'failed' | 'not_submitted';
  submissionCount: number;
  lastSubmissionDate: Date;
  submissions: {
    id: number;
    submissionNumber: number;
    status: 'passed' | 'runtime_error' | 'failed';
    memory: string;
    executionTime: string;
    code: string;
    passedTestCount: number;
    totalTestCount: number;
    createdAt: Date;
  }[];
}

interface StudentDetailData {
  studentName: string;
  totalProblems: number;
  solvedProblems: number;
  totalSubmissions: number;
  problemSubmissions: ProblemSubmission[];
}

interface StudentReportViewProps {
  studentResults: StudentData[];
  totalProblems: number;
}

const StudentReportView: React.FC<StudentReportViewProps> = ({ studentResults, totalProblems }) => {
  const { reportData } = useReportStore();
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<ProblemSubmission | null>(null);

  // 현재 리포트 데이터에서 학생별 상세 데이터 생성
  const getStudentDetailData = (studentName: string): StudentDetailData | null => {
    if (!reportData) return null;

    // 전체 문제 목록 가져오기 (problemAnalysis에서)
    const allProblems = reportData.problemAnalysis || [];

    // 모든 제출 데이터 가져오기
    const allSubmissions = (reportData as any).submissions || [];

    // 해당 학생의 제출 데이터 필터링
    const studentSubmissions = allSubmissions.filter(
      (submission: any) => submission.user?.name === studentName,
    );

    // 전체 문제 목록을 기반으로 문제별 상태 생성
    const problemSubmissions: ProblemSubmission[] = allProblems
      .map((problemInfo: any) => {
        // 해당 문제에 대한 학생의 제출들 찾기
        const problemSubs = studentSubmissions
          .filter((submission: any) => submission.problem?.title === problemInfo.title)
          .sort(
            (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(), // 오래된 순으로 정렬 (첫 제출부터)
          );

        // 상태 결정: 제출이 있고 통과한 적이 있으면 'passed', 제출은 있지만 통과 못했으면 'failed', 제출 없으면 'not_submitted'
        let status: 'passed' | 'failed' | 'not_submitted' = 'not_submitted';
        if (problemSubs.length > 0) {
          const hasPassed = problemSubs.some((sub: any) => sub.is_passed);
          status = hasPassed ? 'passed' : 'failed';
        }

        return {
          problemId: problemSubs.length > 0 ? Number(problemSubs[0].problem_id) : Math.random(), // 임시 ID
          problemTitle: problemInfo.title,
          status,
          submissionCount: problemSubs.length,
          lastSubmissionDate:
            problemSubs.length > 0
              ? new Date(problemSubs[problemSubs.length - 1].created_at)
              : new Date(0), // 마지막(최신) 제출 시간
          submissions: problemSubs.map((sub: any, index: number) => ({
            id: sub.submission_id,
            submissionNumber: index + 1, // 1부터 시작하는 제출 번호
            status: sub.is_passed ? 'passed' : sub.status === 'FAIL' ? 'failed' : 'runtime_error',
            memory: `${Math.round(sub.memory_usage_kb || 0)}KB`,
            executionTime: `${sub.execution_time_ms || 0}ms`,
            code: sub.code || '',
            passedTestCount: sub.passed_tc_count || 0,
            totalTestCount: sub.total_tc_count || 0,
            createdAt: new Date(sub.created_at),
          })),
        };
      })
      .sort((a, b) => {
        // 정렬 순서: 통과한 문제 → 시도한 문제 → 미제출 문제
        if (a.status === 'passed' && b.status !== 'passed') return -1;
        if (a.status !== 'passed' && b.status === 'passed') return 1;
        if (a.status === 'failed' && b.status === 'not_submitted') return -1;
        if (a.status === 'not_submitted' && b.status === 'failed') return 1;

        // 같은 상태 내에서는 최신 활동 순으로
        return b.lastSubmissionDate.getTime() - a.lastSubmissionDate.getTime();
      });

    return {
      studentName,
      totalProblems: allProblems.length,
      solvedProblems: problemSubmissions.filter((p) => p.status === 'passed').length,
      totalSubmissions: studentSubmissions.length,
      problemSubmissions,
    };
  };

  // 학생 선택 핸들러
  const handleStudentSelect = (studentName: string) => {
    const student = studentResults.find((s) => s.studentName === studentName);
    if (!student) return;

    setSelectedStudent(student);
    setSelectedProblem(null);
  };

  // 문제 선택 핸들러
  const handleProblemSelect = (problem: ProblemSubmission) => {
    setSelectedProblem(problem);
  };

  // 현재 선택된 학생의 상세 데이터
  const studentDetailData = selectedStudent
    ? getStudentDetailData(selectedStudent.studentName)
    : null;

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
                students={studentResults.map((s) => s.studentName)}
                onStudentSelect={handleStudentSelect}
                problemSubmissions={studentDetailData?.problemSubmissions || []}
                onProblemSelect={handleProblemSelect}
                selectedProblem={selectedProblem}
                totalProblems={studentDetailData?.totalProblems || 0}
                solvedProblems={studentDetailData?.solvedProblems || 0}
              />
            </div>

            <div className="flex-1">
              <BoardReportStudentSubmission
                title={
                  selectedProblem
                    ? `${selectedProblem.problemTitle} 제출 내역`
                    : '문제를 선택해주세요'
                }
                submissions={selectedProblem?.submissions || []}
              />
            </div>
          </div>
        </div>
      ) : (
        // --- 학생 선택 전 (목록 보기) ---
        // 학생 목록 가운데 정렬
        <div className="flex flex-wrap justify-center gap-8">
          {studentResults.map((student) => (
            <div
              key={student.studentName}
              onClick={() => handleStudentSelect(student.studentName)}
              className="cursor-pointer"
            >
              <CardReportStudent
                studentName={student.studentName}
                correctAnswers={student.correctAnswers}
                totalProblems={totalProblems}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentReportView;
