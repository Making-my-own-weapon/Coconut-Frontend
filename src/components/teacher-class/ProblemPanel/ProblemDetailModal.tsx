import React, { useEffect, useState } from 'react';
import type { Problem } from '../../../store/teacherStore';
import type { ProblemSummary } from '../../../store/problemStore';
import { fetchProblemDetailByIdAPI } from '../../../api/problemApi';

// 두 타입을 모두 처리할 수 있는 유니온 타입
type ProblemData = Problem | ProblemSummary;

interface ProblemDetailModalProps {
  problem: ProblemData;
  onClose: () => void;
}

const ProblemDetailModal: React.FC<ProblemDetailModalProps> = ({ problem, onClose }) => {
  const [detailedProblem, setDetailedProblem] = useState<Problem | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 타입 가드 함수들
  const isFullProblem = (p: ProblemData): p is Problem => {
    return 'description' in p && 'testCases' in p;
  };

  const isSummaryProblem = (p: ProblemData): p is ProblemSummary => {
    return 'source' in p && 'categories' in p;
  };

  // ProblemSummary인 경우 상세 정보를 가져오는 함수
  const fetchDetailedProblem = async () => {
    if (!isSummaryProblem(problem)) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchProblemDetailByIdAPI(problem.problemId);
      console.log('Problem detail response:', response.data); // 디버깅용 로그
      setDetailedProblem(response.data);
    } catch (err: any) {
      setError('문제 내용을 불러오는 데 실패했습니다.');
      console.error('Failed to fetch problem detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // ProblemSummary인 경우 상세 정보를 가져옴
  useEffect(() => {
    if (isSummaryProblem(problem)) {
      fetchDetailedProblem();
    }
  }, [problem.problemId]);

  // 표시할 문제 데이터 결정 (상세 정보가 있으면 상세 정보, 없으면 원본)
  const displayProblem = detailedProblem || (isFullProblem(problem) ? problem : null);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 min-w-[400px] max-w-[90vw] max-h-[90vh] overflow-auto relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl font-bold z-10"
          aria-label="닫기"
        >
          &times;
        </button>
        {/* 제목 */}
        <h2 className="text-2xl font-bold mb-4 text-white">{problem.title}</h2>
        {/* 카테고리 및 소스 정보 */}
        <div className="mb-4 flex flex-wrap gap-2">
          {isSummaryProblem(problem) &&
            problem.categories?.map((cat: string) => (
              <span
                key={cat}
                className="inline-block px-2 py-0.5 bg-blue-600 text-white text-xs rounded"
              >
                {cat}
              </span>
            ))}
          {isSummaryProblem(problem) && (
            <span
              className={`inline-block px-2 py-0.5 text-xs rounded ${
                problem.source === 'My' ? 'bg-purple-500' : 'bg-green-500'
              }`}
            >
              {problem.source === 'My' ? '내 문제' : 'CSES'}
            </span>
          )}
        </div>

        {/* 로딩 상태 */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="text-gray-400">문제 내용을 불러오는 중...</div>
          </div>
        )}

        {/* 에러 상태 */}
        {error && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">{error}</div>
            <button
              onClick={fetchDetailedProblem}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 문제 내용 표시 */}
        {displayProblem && !isLoading && !error && displayProblem.description && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2 text-gray-300">문제 내용</h3>
            <div className="text-gray-200 whitespace-pre-line bg-gray-700 p-4 rounded">
              {displayProblem.description}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemDetailModal;
