import React, { useState } from 'react';

export interface SubmissionData {
  id: string | number;
  submissionNumber: number;
  status: 'passed' | 'runtime_error' | 'failed';
  memory: string;
  executionTime: string;
  code?: string;
}

export interface BoardReportStudentSubmissionProps {
  submissions?: SubmissionData[];
  title?: string;
  className?: string;
}

const BoardReportStudentSubmission: React.FC<BoardReportStudentSubmissionProps> = ({
  submissions = [
    {
      id: 1,
      submissionNumber: 1,
      status: 'runtime_error',
      memory: '9348KB',
      executionTime: '84ms',
      code: 'print("Hello, Error!")',
    },
    {
      id: 2,
      submissionNumber: 2,
      status: 'passed',
      memory: '32412KB',
      executionTime: '32ms',
      code: 'print("Hello, World!")',
    },
  ],
  title = '제출 코드',
  className = '',
}) => {
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionData | null>(null);

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

  return (
    <div
      className={`w-full h-[656px] bg-slate-800 border border-slate-600 rounded-2xl p-6 flex flex-col ${className}`}
    >
      {selectedSubmission ? (
        // --- 제출 선택 후 (코드 보기) ---
        <div>
          <div className="flex justify-between">
            <h2 className="text-white text-2xl font-bold mb-7">
              제출 {selectedSubmission.submissionNumber}번 코드
            </h2>
            <button
              onClick={() => setSelectedSubmission(null)}
              className="mb-4 text-blue-400 hover:underline"
            >
              &lt; 제출 목록으로 돌아가기
            </button>
          </div>
          <div className="bg-black p-4 rounded-md text-white whitespace-pre-wrap overflow-x-auto">
            <code>{selectedSubmission.code}</code>
          </div>
        </div>
      ) : (
        // --- 제출 선택 전 (목록 보기) ---
        <>
          <h2 className="text-white text-2xl font-bold mb-7 flex-shrink-0">{title}</h2>
          <div className="space-y-4 overflow-y-auto">
            {submissions.map((submission) => (
              <div
                key={submission.id}
                onClick={() => setSelectedSubmission(submission)}
                className="bg-[#221F34] rounded-xl flex items-center justify-between p-6 cursor-pointer hover:bg-opacity-80"
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
                      {getStatusText(submission.status)}
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
                    <p className="text-white text-lg font-bold">14/14</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BoardReportStudentSubmission;
