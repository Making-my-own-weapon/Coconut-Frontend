import { create } from 'zustand';

// 1. 결과/에러 상태에 고유 ID를 포함하는 타입 정의
interface WorkerOutput {
  id: number | null;
  data: string | null;
}

interface WorkerState {
  worker: Worker | null;
  isReady: boolean;
  isLoading: boolean;
  status: string;
  // 2. output과 error의 타입을 새로운 인터페이스로 변경
  output: WorkerOutput;
  error: WorkerOutput;
  initialize: () => void;
  // 3. runCode 함수 시그니처에 id 파라미터 추가
  runCode: (code: string, context?: object, id?: number) => void;
  terminate: () => void;
}

export const useWorkerStore = create<WorkerState>((set, get) => ({
  worker: null,
  isReady: false,
  isLoading: true,
  status: '워커를 초기화하고 있습니다...',
  // 4. 초기 상태값 변경
  output: { id: null, data: null },
  error: { id: null, data: null },

  initialize: () => {
    // 이미 워커가 있으면 중복 실행 방지
    if (get().worker) return;

    // public 디렉토리에 있는 워커 스크립트를 로드합니다.
    const worker = new Worker('/pyodide-worker.js');

    worker.onmessage = (event) => {
      // 5. 메시지 핸들러에서 id를 함께 처리
      const { type, data, id } = event.data;
      switch (type) {
        case 'ready':
          set({ isReady: true, isLoading: false, status: '준비 완료' });
          break;
        case 'status':
          set({ status: data });
          break;

        case 'result':
          set({ output: { id, data }, error: { id: null, data: null } });
          break;
        case 'error':
          set({ error: { id, data }, output: { id: null, data: null } });
          break;
        default:
          console.warn('워커로부터 알 수 없는 메시지를 받았습니다:', event.data);
      }
    };

    worker.onerror = (e) => {
      set({ error: { id: null, data: `웹 워커 에러: ${e.message}` }, isLoading: false });
    };

    set({ worker });
  },

  // 6. runCode 함수 구현 수정
  runCode: (code: string, context: object = {}, id: number = 0) => {
    const worker = get().worker;
    if (worker && get().isReady) {
      // 실행 시 이전 결과/에러 초기화
      set({ output: { id: null, data: null }, error: { id: null, data: null } });
      worker.postMessage({ code, id, ...context });
    } else {
      set({ error: { id, data: '워커가 준비되지 않았거나 초기화되지 않았습니다.' } });
    }
  },

  terminate: () => {
    get().worker?.terminate();
    set({ worker: null, isReady: false, isLoading: true, status: '워커 종료됨' });
  },
}));
