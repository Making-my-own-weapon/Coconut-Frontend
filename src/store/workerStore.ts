import { create } from 'zustand';

// 1. 결과/에러 상태에 고유 ID를 포함하는 타입 정의/
interface WorkerOutput {
  id: number | string | null; // id는 숫자, 문자열, 또는 null일 수 있음
  data: string | null;
}

interface WorkerState {
  worker: Worker | null;
  isReady: boolean;
  isLoading: boolean;
  isInitializing: boolean; // 중복 초기화 방지용 상태 추가
  status: string;
  // 2. output과 error의 타입을 새로운 인터페이스로 변경
  output: WorkerOutput;
  error: WorkerOutput;
  initialize: () => void;
  // 3. runCode 함수 시그니처에 id 파라미터 추가
  runCode: (code: string, context?: object, id?: number | string) => void;
  // 정적 분석을 위한 별도 함수
  analyzeCode: (code: string, id?: string) => void;
  terminate: () => void;
  restart: () => void; // 워커 재시작 기능 추가
}

export const useWorkerStore = create<WorkerState>((set, get) => ({
  worker: null,
  isReady: false,
  isLoading: true,
  isInitializing: false, // 초기화 중 상태 추가
  status: '워커를 초기화하고 있습니다...',
  // 4. 초기 상태값 변경
  output: { id: null, data: null },
  error: { id: null, data: null },

  initialize: () => {
    // 이미 워커가 있거나 초기화 중이면 중복 실행 방지
    if (get().worker || get().isInitializing) return;

    // 초기화 중 상태로 설정
    set({ isInitializing: true });

    // public 디렉토리에 있는 워커 스크립트를 로드합니다.
    const worker = new Worker('/pyodide-worker.js');

    worker.onmessage = (event) => {
      // 5. 메시지 핸들러에서 id를 함께 처리 (안전한 타입 변환)
      const { type, data, id } = event.data;
      const safeId = id != null ? id : null; // id가 undefined나 null이 아닌지 확인

      // id가 문자열이고 "syntax-"로 시작하는지 안전하게 확인
      const isSyntaxAnalysis = typeof safeId === 'string' && safeId.startsWith('syntax-');

      switch (type) {
        case 'ready':
          set({ isReady: true, isLoading: false, isInitializing: false, status: '준비 완료' });
          break;
        case 'status':
          set({ status: data });
          break;

        case 'result':
          set({ output: { id: safeId, data }, error: { id: null, data: null } });
          break;
        case 'error':
          set({ error: { id: safeId, data }, output: { id: null, data: null } });
          break;
        case 'analyze_result':
          set({ output: { id: safeId, data }, error: { id: null, data: null } });
          break;
        default:
          console.warn('워커로부터 알 수 없는 메시지를 받았습니다:', event.data);
      }
    };

    worker.onerror = (e) => {
      console.error('Worker error:', e);
      set({
        error: { id: null, data: `웹 워커 에러: ${e.message}` },
        isLoading: false,
        isInitializing: false,
        isReady: false,
        status: '워커 에러 발생',
      });
    };

    set({ worker });
  },

  // 6. runCode 함수 구현 수정
  runCode: (code: string, context: object = {}, id: number | string = 0) => {
    const state = get();
    const worker = state.worker;

    if (!worker) {
      set({ error: { id, data: '워커가 초기화되지 않았습니다. 워커를 먼저 초기화해주세요.' } });
      return;
    }

    if (!state.isReady) {
      if (state.isLoading || state.isInitializing) {
        set({ error: { id, data: '워커가 아직 초기화 중입니다. 잠시 후 다시 시도해주세요.' } });
      } else {
        set({ error: { id, data: '워커가 준비되지 않았습니다. 워커를 재초기화해주세요.' } });
      }
      return;
    }

    // 실행 시 이전 결과/에러 초기화
    set({ output: { id: null, data: null }, error: { id: null, data: null } });
    worker.postMessage({ code, id, ...context });
  },

  // 정적 분석을 위한 별도 함수 (id를 문자열로 전달)
  analyzeCode: (code: string, id: string = 'syntax-analysis') => {
    const state = get();
    const worker = state.worker;

    if (!worker) {
      set({ error: { id, data: '워커가 초기화되지 않았습니다. 워커를 먼저 초기화해주세요.' } });
      return;
    }

    if (!state.isReady) {
      if (state.isLoading || state.isInitializing) {
        set({ error: { id, data: '워커가 아직 초기화 중입니다. 잠시 후 다시 시도해주세요.' } });
      } else {
        set({ error: { id, data: '워커가 준비되지 않았습니다. 워커를 재초기화해주세요.' } });
      }
      return;
    }

    // 실행 시 이전 결과/에러 초기화
    set({ output: { id: null, data: null }, error: { id: null, data: null } });
    worker.postMessage({ task: 'analyze', code, id });
  },

  terminate: () => {
    const worker = get().worker;
    if (worker) {
      // 워커 종료 전 이벤트 리스너 정리
      worker.onmessage = null;
      worker.onerror = null;
      worker.terminate();
    }
    set({
      worker: null,
      isReady: false,
      isLoading: true,
      isInitializing: false,
      status: '워커 종료됨',
      output: { id: null, data: null },
      error: { id: null, data: null },
    });
  },

  restart: () => {
    // 기존 워커 종료
    get().terminate();
    // 새 워커 초기화
    setTimeout(() => {
      get().initialize();
    }, 100);
  },
}));
