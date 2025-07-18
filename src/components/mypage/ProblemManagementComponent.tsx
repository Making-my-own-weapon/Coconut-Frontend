import React from 'react';
import { Trash2 } from 'lucide-react';

interface ProblemData {
  problemId: number;
  title: string;
  description: string;
  category: string;
  createdAt: string;
  testCaseCount: number;
}

interface ProblemManagementComponentProps {
  problem: ProblemData;
  onDelete?: (problemId: number) => void;
  className?: string;
}

const ProblemManagementComponent: React.FC<ProblemManagementComponentProps> = ({
  problem,
  onDelete,
  className = '',
}) => {
  const handleDeleteClick = () => {
    if (onDelete) {
      onDelete(problem.problemId);
    }
  };

  return (
    <div className={`w-full min-h-[122px] relative ${className}`}>
      {/* Main card container */}
      <div className="w-full min-h-[122px] rounded-xl border border-gray-300 bg-gray-50 relative p-6 sm:p-6">
        {/* Title and Category row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-4">
          <h3
            className="text-black text-lg font-semibold leading-[27px] flex-shrink-0"
            style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif' }}
          >
            {problem.title}
          </h3>
          <div className="w-fit h-[26px]">
            <div className="px-3 h-[26px] rounded-[20px] bg-blue-500 flex items-center justify-center">
              <span
                className="text-white text-xs font-medium leading-[18px] whitespace-nowrap"
                style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif' }}
              >
                {problem.category}
              </span>
            </div>
          </div>
        </div>

        {/* Description and Delete button container */}
        <div className="flex items-start justify-between gap-4 mb-4">
          {/* Description */}
          <div className="flex-1 min-w-0">
            <p
              className="text-gray-500 text-sm font-normal leading-[21px] break-words"
              style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              {problem.description}
            </p>
          </div>

          {/* Delete button */}
          <button
            onClick={handleDeleteClick}
            className="w-6 h-6 flex items-center justify-center hover:opacity-70 transition-opacity flex-shrink-0"
            aria-label="문제 삭제"
          >
            <Trash2 className="w-6 h-6 text-red-500" strokeWidth={2} />
          </button>
        </div>

        {/* Bottom metadata */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          {/* Creation date */}
          <div className="flex items-center gap-1">
            <span
              className="text-gray-500 text-[13px] font-normal leading-[19.5px]"
              style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              생성일:
            </span>
            <span
              className="text-gray-500 text-[13px] font-normal leading-[19.5px]"
              style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              {problem.createdAt}
            </span>
          </div>

          {/* Test cases */}
          <div className="flex items-center gap-1">
            <span
              className="text-gray-500 text-[13px] font-normal leading-[19.5px]"
              style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              테스트 케이스:
            </span>
            <span
              className="text-gray-500 text-[13px] font-normal leading-[19.5px]"
              style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              {problem.testCaseCount}
            </span>
            <span
              className="text-gray-500 text-[13px] font-normal leading-[19.5px]"
              style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif' }}
            >
              개
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemManagementComponent;
