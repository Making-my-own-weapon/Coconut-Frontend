//src/components/teacher-class/ProblemImportForm.tsx
import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import { useProblemStore } from '../../store/problemStore';

interface ProblemImportFormProps {
  onClose?: () => void;
}

export default function ProblemImportForm({ onClose }: ProblemImportFormProps) {
  const { roomId } = useParams<{ roomId: string }>();

  // 1. 스토어에서 상태와 액션을 모두 가져옵니다.
  const {
    summaries,
    selectedIds,
    isLoading,
    error,
    fetchAllSummaries,
    toggleProblemSelection,
    assignSelectedProblems,
  } = useProblemStore();

  // 2. UI 필터링을 위한 상태는 컴포넌트에 그대로 둡니다.
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

  // 3. 컴포넌트가 처음 보일 때, 스토어 액션을 호출해 전체 문제 목록을 불러옵니다.
  useEffect(() => {
    fetchAllSummaries();
  }, [fetchAllSummaries]);

  // 4. 스토어에서 가져온 데이터를 바탕으로 필터링/페이징을 수행합니다.
  const filteredList = useMemo(() => {
    return summaries
      .filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
      .filter((p) => sourceFilter === 'All' || p.source === sourceFilter)
      .filter(
        (p) => categoryFilter.length === 0 || p.categories.some((c) => categoryFilter.includes(c)),
      );
  }, [summaries, search, sourceFilter, categoryFilter]);

  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  const pageCount = Math.ceil(filteredList.length / itemsPerPage);

  const toggleCategoryFilter = (cat: string) => {
    setCategoryFilter((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
    setCurrentPage(1); // 필터 변경 시 1페이지로 이동
  };

  // 5. 확인 버튼 핸들러는 스토어의 액션을 호출합니다.
  const handleConfirm = async () => {
    if (!roomId) return;
    try {
      await assignSelectedProblems(Number(roomId));
      // 성공: 에러가 없을 때만 alert
      if (!error) {
        alert('선택한 문제가 할당되었습니다.');
        onClose?.();
      }
    } catch {
      // 실패: 에러 메시지는 이미 스토어에 set됨
    }
  };
  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-800 text-gray-100 rounded-lg">
      {/* --- 헤더 --- */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">문제 불러오기</h1>
        <div className="flex gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">
            취소
          </button>
          <button
            onClick={handleConfirm}
            // 1. 'disabled' 상태를 스토어의 isLoading으로 변경
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 rounded hover:bg-green-500 disabled:opacity-50"
          >
            {isLoading ? '저장 중...' : '선택 완료'}
          </button>
        </div>
      </div>

      {/* --- 에러 메시지 --- */}
      {/* 2. 스토어의 error 상태를 여기에 표시 */}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {/* --- 필터 및 검색 UI (기존과 동일) --- */}
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

      <div className="grid grid-cols-4 gap-2 mb-4">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => toggleCategoryFilter(c)}
            className={`px-3 py-2 rounded text-sm ${
              categoryFilter.includes(c) ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-100'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* --- 문제 목록 --- */}
      <div className="space-y-3 min-h-[200px]">
        {/* 3. 로딩 중일 때와 목록이 비었을 때의 UI 추가 */}
        {isLoading ? (
          <p className="text-center text-gray-400">문제 목록을 불러오는 중...</p>
        ) : paginatedList.length > 0 ? (
          // 4. 컴포넌트의 'list' 대신 'paginatedList'를 사용
          paginatedList.map((p) => (
            <div
              key={p.problemId}
              // 5. 'toggleSelect' 대신 스토어의 'toggleProblemSelection' 호출
              onClick={() => toggleProblemSelection(p.problemId)}
              className="relative bg-gray-700 border border-gray-600 rounded p-4 hover:bg-gray-600 cursor-pointer"
            >
              <h2 className="font-medium text-lg text-gray-100 mb-2">{p.title}</h2>
              <div className="flex flex-wrap gap-1">
                {p.categories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-block px-2 py-0.5 bg-blue-600 text-white text-xs rounded"
                  >
                    {cat}
                  </span>
                ))}
              </div>
              <span
                className={`absolute top-2 right-2 px-2 py-0.5 text-xs rounded ${p.source === 'My' ? 'bg-purple-500' : 'bg-yellow-500'}`}
              >
                {p.source === 'My' ? '내 문제' : '백준'}
              </span>
              {/* 6. 'selectedIds.includes' 대신 스토어의 Set 객체 'selectedIds.has' 사용 */}
              {selectedIds.has(p.problemId) && (
                <Check className="absolute bottom-2 right-2 text-green-500 bg-gray-800 rounded-full p-1" />
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400">조회된 문제가 없습니다.</p>
        )}
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
        {(() => {
          // 5개씩 묶음의 시작 인덱스 계산
          const groupSize = 5;
          const groupStart = Math.floor((currentPage - 1) / groupSize) * groupSize + 1;
          const groupEnd = Math.min(pageCount, groupStart + groupSize - 1);
          return Array.from({ length: groupEnd - groupStart + 1 }, (_, i) => groupStart + i).map(
            (num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`w-8 text-center rounded ${
                  num === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'
                }`}
              >
                {num}
              </button>
            ),
          );
        })()}
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
