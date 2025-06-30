import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Check } from 'lucide-react';

// 문제 항목 타입: 다중 카테고리 지원
interface ProblemItem {
  id: number;
  title: string;
  source: 'My' | 'BOJ';
  category: string[];
}

// 더미 문제 데이터 (8개 카테고리에 맞춤)
const dummyProblems: ProblemItem[] = [
  {
    id: 1,
    title: '그래프 순회',
    source: 'BOJ',
    category: ['그래프', '백트래킹·완전 탐색'],
  },
  { id: 2, title: '다익스트라 최단 경로', source: 'My', category: ['그래프'] },
  { id: 3, title: '배낭 문제 0-1', source: 'BOJ', category: ['동적 계획법'] },
  {
    id: 4,
    title: '최장 증가 부분 수열',
    source: 'My',
    category: ['동적 계획법'],
  },
  {
    id: 5,
    title: '활동 선택 문제',
    source: 'BOJ',
    category: ['그리디', '동적 계획법'],
  },
  {
    id: 6,
    title: '허프만 코딩',
    source: 'My',
    category: ['그리디', '동적 계획법'],
  },
  {
    id: 7,
    title: '스택을 이용한 괄호 검사',
    source: 'BOJ',
    category: ['자료 구조'],
  },
  { id: 8, title: '트라이 구조 구현', source: 'My', category: ['자료 구조'] },
  { id: 9, title: '소수 판별', source: 'BOJ', category: ['수학'] },
  { id: 10, title: '모듈러 곱셈 역원', source: 'My', category: ['수학'] },
  { id: 11, title: 'KMP 문자열 매칭', source: 'BOJ', category: ['문자열'] },
  {
    id: 12,
    title: 'Aho-Corasick 자동 완성',
    source: 'My',
    category: ['문자열'],
  },
  {
    id: 13,
    title: '퀵 정렬 구현',
    source: 'BOJ',
    category: ['분할 정복·이진 탐색'],
  },
  {
    id: 14,
    title: '병합 정렬 구현',
    source: 'My',
    category: ['분할 정복·이진 탐색'],
  },
  {
    id: 15,
    title: 'N-Queen 문제',
    source: 'BOJ',
    category: ['백트래킹·완전 탐색'],
  },
  {
    id: 16,
    title: '스도쿠 백트래킹',
    source: 'My',
    category: ['백트래킹·완전 탐색'],
  },
];

export default function ProblemBrowsePage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'All' | 'My' | 'BOJ'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [solveLimitFilter, setSolveLimitFilter] = useState('');
  const [list, setList] = useState<ProblemItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => setList(dummyProblems), []);

  // 필터 및 교집합 매칭 수 기준 정렬
  const filtered = list
    .filter(
      (p) =>
        p.title.includes(search) &&
        (sourceFilter === 'All' || p.source === sourceFilter) &&
        (categoryFilter.length === 0 || p.category.some((c) => categoryFilter.includes(c))),
    )
    .sort((a, b) => {
      const countA = categoryFilter.length
        ? a.category.filter((c) => categoryFilter.includes(c)).length
        : 0;
      const countB = categoryFilter.length
        ? b.category.filter((c) => categoryFilter.includes(c)).length
        : 0;
      return countB - countA;
    });

  const sources = ['All', 'My', 'BOJ'] as const;
  // 8가지 카테고리
  const categories = [
    '그래프',
    '동적 계획법',
    '그리디',
    '자료 구조',
    '수학',
    '문자열',
    '분할 정복·이진 탐색',
    '백트래킹·완전 탐색',
  ];

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleCategory = (cat: string) => {
    setCategoryFilter((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const handleConfirm = () => console.log('제출된 문제 IDs:', selectedIds);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-800 text-gray-100 rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold mb-1">문제 선택</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-500"
          >
            생성
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <input
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100"
            placeholder="문제 제목 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute right-3 top-3 text-gray-400" />
        </div>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value as 'All' | 'My' | 'BOJ')}
          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100"
        >
          {sources.map((s) => (
            <option key={s} value={s}>
              {s === 'All' ? '전체 문제' : s === 'My' ? '내 문제' : '백준 문제'}
            </option>
          ))}
        </select>
        <input
          type="number"
          min="0"
          className="w-32 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100"
          placeholder="풀이시간(분)"
          value={solveLimitFilter}
          onChange={(e) => setSolveLimitFilter(e.target.value)}
        />
      </div>
      {/* 카테고리 버튼 그리드 */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => toggleCategory(c)}
            className={`px-3 py-2 rounded ${categoryFilter.includes(c) ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-100'}`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 문제 카드 목록 */}
      <div className="space-y-3">
        {filtered.map((p) => (
          <div
            key={p.id}
            onClick={() => toggleSelect(p.id)}
            className="relative bg-gray-700 border border-gray-600 rounded p-4 hover:bg-gray-600 cursor-pointer"
          >
            <h2 className="font-medium text-lg mb-2 text-gray-100">{p.title}</h2>
            <div className="flex flex-wrap gap-1 mb-2">
              {p.category.map((cat) => (
                <span
                  key={cat}
                  className="inline-block px-2 py-0.5 bg-blue-600 text-white text-xs rounded"
                >
                  {cat}
                </span>
              ))}
            </div>
            <span
              className={`absolute top-2 right-2 px-2 py-0.5 text-white text-xs rounded ${p.source === 'My' ? 'bg-purple-500' : 'bg-yellow-500'}`}
            >
              {p.source === 'My' ? '내 문제' : '백준'}
            </span>
            {selectedIds.includes(p.id) && (
              <Check className="absolute bottom-2 right-2 text-green-500 bg-gray-800 rounded-full p-1" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
