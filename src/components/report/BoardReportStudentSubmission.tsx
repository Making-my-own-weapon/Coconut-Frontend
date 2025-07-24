import React, { useState, useEffect } from 'react';

export interface SubmissionData {
  id: string | number;
  submissionNumber: number;
  status: 'passed' | 'runtime_error' | 'failed';
  memory: string;
  executionTime: string;
  code?: string;
  passedTestCount?: number;
  totalTestCount?: number;
  stdout?: string; // stdout 정보 추가
}

export interface BoardReportStudentSubmissionProps {
  submissions?: SubmissionData[];
  title?: string;
  className?: string;
}

const BoardReportStudentSubmission: React.FC<BoardReportStudentSubmissionProps> = ({
  submissions = [],
  title = '제출 코드',
  className = '',
}) => {
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionData | null>(null);

  // submissions prop이 바뀔 때마다 코드 뷰를 닫는다
  useEffect(() => {
    setSelectedSubmission(null);
  }, [submissions]);

  // 제출 결과의 간단한 표시 메시지
  const getSimpleStatusMessage = (submission: SubmissionData): string => {
    if (submission.status === 'passed') return '통과';

    // stdout이 있으면 첫 줄의 앞부분만 사용
    if (submission.stdout) {
      const firstLine = submission.stdout.split('\n')[0].trim();
      if (firstLine.length > 20) {
        return firstLine.substring(0, 20) + '...';
      }
      return firstLine || '실행 오류';
    }

    // 기본 상태별 메시지
    switch (submission.status) {
      case 'runtime_error':
        return '런타임 에러';
      case 'failed':
        return '실행 실패';
      default:
        return '실패';
    }
  };

  const getStatusText = (status: SubmissionData['status']) => {
    switch (status) {
      case 'passed':
        return '통과';
      case 'runtime_error':
        return '런타임에러';
      case 'failed':
        return '실패';
      default:
        return '실패';
    }
  };

  const getStatusColor = (status: SubmissionData['status']) => {
    switch (status) {
      case 'passed':
        return '#5DFFA3';
      case 'runtime_error':
        return '#FF5252';
      case 'failed':
        return '#FF5252';
      default:
        return '#FF5252';
    }
  };

  // 문제를 선택하지 않은 경우
  if (title === '문제를 선택해주세요') {
    return (
      <div
        className={`w-full h-[656px] bg-slate-800 border border-slate-600 rounded-2xl p-6 flex flex-col items-center justify-center ${className}`}
      >
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="w-16 h-16 text-slate-600 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-white text-xl font-bold mb-2">문제를 선택해주세요</h3>
          <p className="text-slate-400 text-sm">
            왼쪽에서 문제를 선택하면
            <br />
            해당 문제의 제출 내역을 확인할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`w-full h-[656px] bg-slate-800 border border-slate-600 rounded-2xl p-6 flex flex-col ${className}`}
    >
      {selectedSubmission ? (
        // --- 제출 선택 후 (코드 보기) ---
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white text-2xl font-bold">
              제출 {selectedSubmission.submissionNumber}번 코드
            </h2>
            <button
              onClick={() => setSelectedSubmission(null)}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              ← 제출 목록으로 돌아가기
            </button>
          </div>

          {/* 제출 결과 정보 */}
          <div className="mb-4 p-3 bg-slate-700 rounded-lg">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-slate-400 text-sm">결과</p>
                <p
                  className="text-lg font-bold"
                  style={{ color: getStatusColor(selectedSubmission.status) }}
                >
                  {getSimpleStatusMessage(selectedSubmission)}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">메모리</p>
                <p className="text-white text-lg font-bold">{selectedSubmission.memory}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">시간</p>
                <p className="text-white text-lg font-bold">{selectedSubmission.executionTime}</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">테스트 케이스</p>
                <p className="text-white text-lg font-bold">
                  {selectedSubmission.passedTestCount || 0}/{selectedSubmission.totalTestCount || 0}
                </p>
              </div>
            </div>
          </div>

          {/* 코드 영역 */}
          <div className="flex-1 flex flex-col">
            <h3 className="text-white text-lg font-semibold mb-2">코드</h3>
            <div className="flex-1 bg-black p-4 rounded-md text-white font-mono text-sm h-full max-h-full overflow-auto">
              <pre className="whitespace-pre-wrap">
                {selectedSubmission.code || '코드를 불러올 수 없습니다.'}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        // --- 제출 선택 전 (목록 보기) ---
        <>
          <h2 className="text-white text-2xl font-bold mb-6 flex-shrink-0">{title}</h2>

          {submissions.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-slate-400">
                <div className="mb-4">
                  <svg
                    className="w-12 h-12 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <p className="text-lg font-semibold mb-1">제출 내역이 없습니다</p>
                <p className="text-sm">이 문제에 대한 제출 기록이 없습니다.</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <div className="space-y-4 overflow-y-auto h-full">
                {submissions.map((submission) => (
                  <div
                    key={submission.id}
                    onClick={() => setSelectedSubmission(submission)}
                    className="bg-[#221F34] rounded-xl flex items-center justify-between p-6 cursor-pointer hover:bg-[#2A2640] transition-colors border border-slate-600"
                  >
                    <div className="text-white text-lg font-bold">
                      제출 {submission.submissionNumber}
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-slate-400 text-sm">결과</p>
                        <p
                          className="text-lg font-bold"
                          style={{ color: getStatusColor(submission.status) }}
                        >
                          {getSimpleStatusMessage(submission)}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">메모리</p>
                        <p className="text-white text-lg font-bold">{submission.memory}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">시간</p>
                        <p className="text-white text-lg font-bold">{submission.executionTime}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm">테스트 케이스</p>
                        <p className="text-white text-lg font-bold">
                          {submission.passedTestCount || 0}/{submission.totalTestCount || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BoardReportStudentSubmission;
