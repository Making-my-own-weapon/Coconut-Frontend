import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TestCase {
  input: string;
  output: string;
}

export default function ProblemCreateForm() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [memoryLimit, setMemoryLimit] = useState('');
  const [timeLimitSec, setTimeLimitSec] = useState('');
  const [timeLimitMin, setTimeLimitMin] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [testCases, setTestCases] = useState<TestCase[]>([
    { input: '', output: '' },
  ]);

  const addTestCase = () => {
    setTestCases((prev) => [...prev, { input: '', output: '' }]);
  };

  const updateTestCase = (
    idx: number,
    field: keyof TestCase,
    value: string,
  ) => {
    setTestCases((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      title,
      memoryLimit,
      timeLimitSec,
      timeLimitMin,
      category,
      description,
      testCases,
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-800 text-gray-100 rounded-lg">
      <form onSubmit={handleSubmit}>
        {/* Header row */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">문제 생성</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 rounded hover:bg-green-500"
            >
              생성
            </button>
          </div>
        </div>

        {/* Title & Category */}
        <div className="grid grid-cols-2 gap-4 mb-6">
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
            <label className="block mb-1 text-sm">카테고리</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-gray-700 rounded"
              placeholder="예: Array, Hash Table"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
        </div>

        {/* Limits */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block mb-1 text-sm">메모리 제한</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-gray-700 rounded"
              placeholder="예: 10MB"
              value={memoryLimit}
              onChange={(e) => setMemoryLimit(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 text-sm">시간 제한(초)</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-gray-700 rounded"
              placeholder="예: 3초"
              value={timeLimitSec}
              onChange={(e) => setTimeLimitSec(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className="block mb-1 text-sm">시간 제한(분)</label>
            <input
              type="text"
              className="w-full px-3 py-2 bg-gray-700 rounded"
              placeholder="예: 1분"
              value={timeLimitMin}
              onChange={(e) => setTimeLimitMin(e.target.value)}
            />
          </div>
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
  );
}
