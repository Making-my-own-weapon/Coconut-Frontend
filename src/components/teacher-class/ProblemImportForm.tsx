import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, Check } from 'lucide-react';
import { fetchAllSummaries, assignProblemsToRoom } from './api/ProblemApi';

// 요약(summary) 타입 정의
export interface ProblemSummary {
  id: number;
  title: string;
  source: 'My' | 'BOJ';
  category: string[];
}

export default function ProblemImportForm() {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();

  // 전체 요약 데이터
  const [allProblems, setAllProblems] = useState<ProblemSummary[]>([]);
  const [list, setList] = useState<ProblemSummary[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  // 필터/검색/페이징 상태
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'All' | 'My' | 'BOJ'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const sources = ['All', 'My', 'BOJ'] as const;
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

  // 초기 로드: 전체 요약 불러오기
  useEffect(() => {
    fetchAllSummaries()
      .then((data) => setAllProblems(data))
      .catch(console.error);
  }, []);

  // 필터·검색·페이지 변경 시 클라이언트 필터링 및 페이징
  useEffect(() => {
    const filtered = allProblems
      .filter((p) => p.title.includes(search))
      .filter((p) => sourceFilter === 'All' || p.source === sourceFilter)
      .filter(
        (p) => categoryFilter.length === 0 || p.category.some((c) => categoryFilter.includes(c)),
      );

    setTotalCount(filtered.length);
    const start = (currentPage - 1) * itemsPerPage;
    setList(filtered.slice(start, start + itemsPerPage));
  }, [allProblems, search, sourceFilter, categoryFilter, currentPage]);

  const toggleCategory = (cat: string) =>
    setCategoryFilter((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );

  const [selectedIds, setSelectedIds] = useState<number[]>([]); //pid배열
  const toggleSelect = (id: number) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleConfirm = async () => {
    // 선택된 문제들 방 할당 API 호출 로직
    if (!roomId) {
      alert('잘못된 방 정보입니다.');
      return;
    }

    if (selectedIds.length === 0) {
      alert('하나 이상의 문제를 선택해주세요.');
      return;
    }

    try {
      // selectedIds 는 ProblemImportForm 내부에서 setSelectedIds 로 관리하는 배열
      await assignProblemsToRoom(Number(roomId), selectedIds);
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert('문제 할당 중 오류가 발생했습니다.');
    }
  };

  const pageCount = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-800 text-gray-100 rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">문제 불러오기</h1>
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
            선택 완료
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100"
          placeholder="제목 검색..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
        <Search className="absolute right-3 top-3 text-gray-400" />
        <select
          value={sourceFilter}
          onChange={(e) => {
            setSourceFilter(e.target.value as 'All' | 'My' | 'BOJ');
            setCurrentPage(1);
          }}
          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-100"
        >
          {sources.map((s) => (
            <option key={s} value={s}>
              {s === 'All' ? '전체' : s === 'My' ? '내 문제' : '백준'}
            </option>
          ))}
        </select>
      </div>

      {/* Category Buttons */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => {
              toggleCategory(c);
              setCurrentPage(1);
            }}
            className={`px-3 py-2 rounded text-sm ${
              categoryFilter.includes(c) ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-100'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Problem List */}
      <div className="space-y-3 min-h-[200px]">
        {list.map((p) => (
          <div
            key={p.id}
            onClick={() => toggleSelect(p.id)}
            className="relative bg-gray-700 border border-gray-600 rounded p-4 hover:bg-gray-600 cursor-pointer"
          >
            <h2 className="font-medium text-lg text-gray-100 mb-2">{p.title}</h2>
            <div className="flex flex-wrap gap-1">
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
              className={`absolute top-2 right-2 px-2 py-0.5 text-xs rounded ${
                p.source === 'My' ? 'bg-purple-500' : 'bg-yellow-500'
              }`}
            >
              {p.source === 'My' ? '내 문제' : '백준'}
            </span>
            {selectedIds.includes(p.id) && (
              <Check className="absolute bottom-2 right-2 text-green-500 bg-gray-800 rounded-full p-1" />
            )}
          </div>
        ))}
        {list.length === 0 && <p className="text-center text-gray-400">조회된 문제가 없습니다.</p>}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-6">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
        >
          이전
        </button>
        {Array.from({ length: pageCount }, (_, i) => i + 1).map((num) => (
          <button
            key={num}
            onClick={() => setCurrentPage(num)}
            className={`w-8 text-center rounded ${
              num === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'
            }`}
          >
            {num}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, pageCount))}
          disabled={currentPage === pageCount}
          className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
        >
          다음
        </button>
      </div>
    </div>
  );
}
