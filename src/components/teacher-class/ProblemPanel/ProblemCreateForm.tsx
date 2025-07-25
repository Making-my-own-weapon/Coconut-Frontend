// src/components/teacher-class/ProblemCreateForm.tsx
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useProblemStore } from '../../../store/problemStore';
import { showToast, showError } from '../../../utils/sweetAlert';
import type { CreateProblemDto } from '../../../api/problemApi';

interface ProblemCreateFormProps {
  onClose?: () => void;
}

export default function ProblemCreateForm({ onClose }: ProblemCreateFormProps) {
  const { roomId } = useParams<{ roomId: string }>();
  const { createAndAssignProblem, isLoading, error } = useProblemStore();

  // 폼 상태
  const [title, setTitle] = useState('');
  const [timeLimitMs, setTimeLimitMs] = useState(''); // ms 단위 직접 입력
  const [solveTimeLimitMin, setSolveTimeLimitMin] = useState(''); // 분 단위 옵션
  const [memoryLimitKb, setMemoryLimitKb] = useState(''); // KB 단위 직접 입력
  const [categories, setCategories] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  // 공개/히든 테스트케이스 상태 분리
  const [publicTestCase, setPublicTestCase] = useState({ input: '', output: '' });
  const [hiddenTestCases, setHiddenTestCases] = useState([{ input: '', output: '' }]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // (헬퍼 함수들은 기존과 동일)
  const allCategories = [
    '그래프',
    '동적 계획법',
    '그리디',
    '자료 구조',
    '수학',
    '문자열',
    '분할 정복·이진 탐색',
    '백트래킹·완전 탐색',
  ];
  const toggleCategory = (cat: string) =>
    setCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  // 공개/히든 테스트케이스 헬퍼 함수
  const addHiddenTestCase = () =>
    setHiddenTestCases((prev) => [...prev, { input: '', output: '' }]);
  const updateHiddenTestCase = (idx: number, field: 'input' | 'output', value: string) => {
    const copy = [...hiddenTestCases];
    copy[idx] = { ...copy[idx], [field]: value };
    setHiddenTestCases(copy);
  };
  const removeHiddenTestCase = (idx: number) => {
    setHiddenTestCases((prev) => prev.filter((_, i) => i !== idx));
  };

  // 3. handleSubmit 로직을 스토어 액션 호출로 단순화합니다.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[Debug] handleSubmit 실행', {
      title,
      timeLimitMs,
      memoryLimitKb,
      solveTimeLimitMin,
      description,
      categories,
      publicTestCase,
      hiddenTestCases,
    });
    // 빈 칸 체크
    if (
      !title ||
      !timeLimitMs ||
      !memoryLimitKb ||
      !description ||
      categories.length === 0 ||
      !publicTestCase.input ||
      !publicTestCase.output ||
      hiddenTestCases.length === 0 ||
      hiddenTestCases.some((tc) => !tc.input || !tc.output)
    ) {
      return;
    }
    if (!roomId) {
      showError('오류', '유효하지 않은 방입니다.');
      return;
    }

    // DTO 조립
    // CreateProblemDto의 testCases 타입에 isHidden이 포함되어야 함 (없으면 백엔드 타입도 수정 필요)
    const dto: CreateProblemDto = {
      title,
      timeLimitMs: Number(timeLimitMs),
      memoryLimitKb: Number(memoryLimitKb),
      ...(solveTimeLimitMin ? { solveTimeLimitMin: Number(solveTimeLimitMin) } : {}),
      source: 'My',
      categories,
      description,
      testCases: [
        { inputTc: publicTestCase.input, outputTc: publicTestCase.output },
        ...hiddenTestCases.map((tc) => ({ inputTc: tc.input, outputTc: tc.output })),
      ],
    };

    try {
      setErrorMessage(null);
      await createAndAssignProblem(dto, Number(roomId));
      showToast('success', '문제가 성공적으로 생성 및 할당되었습니다.');
      onClose?.();
    } catch {
      // 에러는 store.error 에서 표시
    }
  };
  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-800 text-gray-100 rounded-lg">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">문제 생성</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-500 disabled:bg-gray-500"
            >
              {isLoading ? '생성 중...' : '확인'}
            </button>
          </div>
        </div>

        {/* 에러 메시지 */}
        {(errorMessage || error) && (
          <p className="text-red-400 text-center mb-4">{errorMessage || error}</p>
        )}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* 제목 */}
          <label className="block mb-1 text-sm">문제 제목</label>
          <input
            type="text"
            className="w-full mb-4 p-2 bg-gray-700 rounded"
            placeholder="예: Two Sum"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* 풀이 제한시간 (분) */}
          <label className="block mb-1 text-sm">문제 풀이 제한시간 (분)</label>
          <input
            type="number"
            min="1"
            className="w-full mb-4 p-2 bg-gray-700 rounded"
            placeholder="예: 1"
            value={solveTimeLimitMin}
            onChange={(e) => setSolveTimeLimitMin(e.target.value)}
          />

          {/* 실행 제한시간 (ms) */}
          <label className="block mb-1 text-sm">실행 제한시간 (ms)</label>
          <input
            type="number"
            min="0"
            className="w-full mb-4 p-2 bg-gray-700 rounded"
            placeholder="예: 1000"
            value={timeLimitMs}
            onChange={(e) => setTimeLimitMs(e.target.value)}
          />

          {/* 메모리 제한 (KB) */}
          <label className="block mb-1 text-sm">메모리 제한 (KB)</label>
          <input
            type="number"
            min="0"
            className="w-full mb-4 p-2 bg-gray-700 rounded"
            placeholder="예: 65536"
            value={memoryLimitKb}
            onChange={(e) => setMemoryLimitKb(e.target.value)}
          />
        </div>

        {/* 카테고리 */}
        <label className="block mb-1 text-sm">문제 분류</label>
        <div className="grid grid-cols-4 gap-2 mb-6">
          {allCategories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => toggleCategory(c)}
              className={`px-3 py-2 rounded text-sm ${
                categories.includes(c) ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-100'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* 설명 */}
        <label className="block mb-1 text-sm">문제 설명</label>
        <textarea
          className="w-full h-24 mb-6 p-3 bg-gray-700 rounded"
          placeholder="문제 내용을 입력하세요"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* 테스트 케이스 */}
        <div className="mb-6">
          {/* 공개 테스트케이스 (항상 1개, 위에 고정) */}
          <div className="mb-4 bg-gray-700 rounded p-3">
            <h3 className="text-lg font-medium mb-2">예시 테스트케이스</h3>
            <div className="grid grid-cols-2 gap-2">
              <textarea
                className="w-full h-16 p-2 bg-gray-800 rounded"
                placeholder="입력"
                value={publicTestCase.input}
                onChange={(e) => setPublicTestCase({ ...publicTestCase, input: e.target.value })}
              />
              <textarea
                className="w-full h-16 p-2 bg-gray-800 rounded"
                placeholder="출력"
                value={publicTestCase.output}
                onChange={(e) => setPublicTestCase({ ...publicTestCase, output: e.target.value })}
              />
            </div>
          </div>
          {/* 히든 테스트케이스 (아래, 여러 개 추가/삭제 가능) */}
          <div className="bg-gray-700 rounded p-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">히든 테스트케이스</h3>
              <button
                type="button"
                onClick={addHiddenTestCase}
                className="flex items-center px-3 py-1 bg-blue-600 rounded text-sm hover:bg-blue-700"
              >
                <Plus size={16} className="mr-1" /> 추가
              </button>
            </div>
            {hiddenTestCases.map((tc, idx) => (
              <div key={idx} className="relative grid grid-cols-2 gap-2 mb-2">
                <textarea
                  className="w-full h-16 p-2 bg-gray-800 rounded"
                  placeholder="입력"
                  value={tc.input}
                  onChange={(e) => updateHiddenTestCase(idx, 'input', e.target.value)}
                />
                <textarea
                  className="w-full h-16 p-2 bg-gray-800 rounded"
                  placeholder="출력"
                  value={tc.output}
                  onChange={(e) => updateHiddenTestCase(idx, 'output', e.target.value)}
                />
                {hiddenTestCases.length > 1 && idx > 0 && (
                  <button
                    type="button"
                    onClick={() => removeHiddenTestCase(idx)}
                    className="absolute right-2 bottom-2 w-5 h-5 rounded-full bg-red-500 text-white text-base flex items-center justify-center hover:bg-red-600"
                    title="이 히든 테스트케이스 삭제"
                  >
                    -
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
