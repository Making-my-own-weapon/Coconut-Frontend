import React, { useEffect } from 'react';
import MyPageComponentProblem from './MyPageComponentProblem';
import ProblemManagementComponent from './ProblemManagementComponent';
import { useProblemStore } from '../../store/problemStore'; // 👈 problemStore import
import { showConfirm, showToast } from '../../utils/sweetAlert';

const ProblemManagementView: React.FC = () => {
  // 1. 스토어에서 상태와 액션을 가져옵니다.
  const { myProblems, fetchMyProblems, deleteProblem, isLoading } = useProblemStore();

  // 2. 컴포넌트가 마운트될 때, 내가 만든 문제 목록을 불러옵니다.
  useEffect(() => {
    fetchMyProblems();
  }, [fetchMyProblems]);

  // 3. 삭제 핸들러가 스토어의 deleteProblem 액션을 호출하도록 수정합니다.
  const handleDeleteProblem = async (problemId: number) => {
    const confirmed = await showConfirm(`${problemId}번 문제`, '정말로 삭제하시겠습니까?', 'light');
    if (confirmed) {
      try {
        await deleteProblem(problemId);
        showToast('success', '문제가 삭제되었습니다.', 'light');
      } catch {
        showToast('error', '문제 삭제에 실패했습니다.', 'light');
      }
    }
  };

  return (
    <div className="flex-1 h-[900px] rounded-2xl border border-gray-200 bg-white shadow-md p-8 flex flex-col">
      <div className="flex-shrink-0">
        <h1 className="text-black font-bold text-[32px] leading-[48px] mb-1">문제 관리</h1>
        <span className="text-gray-500">내가 만든 알고리즘 문제들을 관리할 수 있습니다.</span>
      </div>

      <div className="mt-5 mb-6 flex-shrink-0">
        <MyPageComponentProblem totalProblems={myProblems.length} />
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="space-y-4">
            {myProblems.map((problem) => (
              <ProblemManagementComponent
                key={problem.problemId}
                problem={problem}
                onDelete={handleDeleteProblem}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemManagementView;
