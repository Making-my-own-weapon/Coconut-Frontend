//src/comoponents/teacher-class/ProblemCreateForm.tsx
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useProblemStore } from '../../store/problemStore';
import type { CreateProblemDto } from '../../api/problemApi';

interface ProblemCreateFormProps {
  onClose?: () => void;
}

export default function ProblemCreateForm({ onClose }: ProblemCreateFormProps) {
  const { roomId } = useParams<{ roomId: string }>();

  // 1. 스토어에서 필요한 액션과 상태를 가져옵니다.
  const { createAndAssignProblem, isLoading, error } = useProblemStore();

  // 2. 폼 입력을 위한 상태는 컴포넌트 내부에 그대로 둡니다.
  const [title, setTitle] = useState('');
  const [timeLimitMin, setTimeLimitMin] = useState('');
  const [timeLimitSec, setTimeLimitSec] = useState('');
  const [memoryLimit, setMemoryLimit] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [testCases, setTestCases] = useState([{ input: '', output: '' }]);

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
  const addTestCase = () => setTestCases((prev) => [...prev, { input: '', output: '' }]);
  const updateTestCase = (idx: number, field: 'input' | 'output', value: string) => {
    const copy = [...testCases];
    copy[idx] = { ...copy[idx], [field]: value };
    setTestCases(copy);
  };

  // 3. handleSubmit 로직을 스토어 액션 호출로 단순화합니다.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId) {
      alert('잘못된 접근입니다. 유효한 수업 방 안에서만 문제를 생성할 수 있습니다.');
      return;
    }

    const dto: CreateProblemDto = {
      title,
      timeLimit: Number(timeLimitMin) * 60 + Number(timeLimitSec),
      memoryLimit: Number(memoryLimit),
      categories,
      description,
      testCases,
    };

    try {
      await createAndAssignProblem(dto, Number(roomId));
      alert('문제가 성공적으로 생성 및 할당되었습니다.');
      onClose?.(); // 성공 시 부모로부터 받은 onClose 함수를 호출하여 모달을 닫습니다.
    } catch {
      // 에러 표시는 스토어의 error 상태를 통해 자동으로 처리됩니다.
    }
  };

  return (
    <>
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

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          {/* Title | 풀이 제한시간 */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block mb-1 text-sm">문제 제목</label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-gray-700 rounded"
                placeholder="예: Two Sum"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">전체 풀이 제한시간 (분)</label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 bg-gray-700 rounded"
                placeholder="예: 1분"
                value={timeLimitMin}
                onChange={(e) => setTimeLimitMin(e.target.value)}
              />
            </div>
          </div>

          {/* 시간 제한(초) | 메모리 제한 */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block mb-1 text-sm">시간 제한 (초)</label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 bg-gray-700 rounded"
                placeholder="예: 3초"
                value={timeLimitSec}
                onChange={(e) => setTimeLimitSec(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1 text-sm">메모리 제한</label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 bg-gray-700 rounded"
                placeholder="예: 10MB"
                value={memoryLimit}
                onChange={(e) => setMemoryLimit(e.target.value)}
              />
            </div>
          </div>

          {/* Categories */}
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

          {/* Description */}
          <div className="mb-6">
            <label className="block mb-1 text-sm">문제 설명</label>
            <textarea
              className="w-full h-24 p-3 bg-gray-700 rounded"
              placeholder="문제 내용을 입력하세요"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Test Cases */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">테스트 케이스</h3>
              <button
                type="button"
                onClick={addTestCase}
                className="flex items-center px-3 py-1 bg-blue-600 rounded text-sm hover:bg-blue-700"
              >
                <Plus size={16} className="mr-1" /> 추가
              </button>
            </div>
            {testCases.map((tc, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-4 mb-2">
                <textarea
                  className="w-full h-16 p-2 bg-gray-700 rounded"
                  placeholder="입력"
                  value={tc.input}
                  onChange={(e) => updateTestCase(idx, 'input', e.target.value)}
                />
                <textarea
                  className="w-full h-16 p-2 bg-gray-700 rounded"
                  placeholder="출력"
                  value={tc.output}
                  onChange={(e) => updateTestCase(idx, 'output', e.target.value)}
                />
              </div>
            ))}
          </div>
        </form>
      </div>
    </>
  );
}
