import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProblem, assignProblemsToRoom } from './api/ProblemApi';
import type { CreateProblemDto } from './api/ProblemApi';

interface TestCase {
  input: string;
  output: string;
}

export default function ProblemCreateForm() {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();

  // --- form state ---
  const [title, setTitle] = useState('');
  const [timeLimitMin, setTimeLimitMin] = useState('');
  const [timeLimitSec, setTimeLimitSec] = useState('');
  const [memoryLimit, setMemoryLimit] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [testCases, setTestCases] = useState<TestCase[]>([{ input: '', output: '' }]);

  // modal + 방 할당용 ID 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createdId, setCreatedId] = useState<number | null>(null); //방금 새로만든 pid

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

  const updateTestCase = (idx: number, field: keyof TestCase, value: string) =>
    setTestCases((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });

  // 1) 제출 시: DB 저장 → ID 확보 → 모달 오픈
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dto: CreateProblemDto = {
        title,
        timeLimit: Number(timeLimitMin) * 60 + Number(timeLimitSec),
        memoryLimit: Number(memoryLimit),
        categories,
        description,
        testCases,
      };
      const { id } = await createProblem(dto);
      setCreatedId(id);
      setIsModalOpen(true);
    } catch (err) {
      console.error(err);
      alert('문제 저장 중 오류가 발생했습니다.');
    }
  };
  // 2) 모달 “예”: 방에 할당 → 뒤로 이동
  const handleSave = async () => {
    if (roomId && createdId != null) {
      try {
        await assignProblemsToRoom(Number(roomId), [createdId]);
      } catch (err) {
        console.error(err);
        alert('방 할당 중 오류가 발생했습니다.');
        return;
      }
    }
    navigate(-1);
  };

  // 3) 모달 “아니요”: 방에 문제 핟당 없이 모달 닫고 뒤로
  const handleCancel = () => {
    setIsModalOpen(false);
    navigate(-1);
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
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
              >
                취소
              </button>
              <button type="submit" className="px-4 py-2 bg-green-600 rounded hover:bg-green-500">
                확인
              </button>
            </div>
          </div>

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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-6 w-80">
            <h3 className="text-gray-100 text-lg font-semibold mb-4">
              DB에 내가 만든 문제가 추가되었습니다.
            </h3>
            <h3 className="text-gray-100 text-lg font-semibold mb-4">현재 방에도 저장할까요?</h3>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
              >
                예
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-200"
              >
                아니요
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
