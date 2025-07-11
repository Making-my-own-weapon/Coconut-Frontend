import { useWorkerStore } from '../store/workerStore';
import { extractFunctions, estimateComplexity } from './analysisUtils';

export interface AnalysisResult {
  functions: Array<{ name: string; time: string; space: string; errors: string[] }>;
  global: { time: string; space: string; errors: string[] };
}

// 고유한 분석 요청 ID를 생성하기 위한 카운터
let analysisIdCounter = 0;

export async function analyzePythonCodeBlocks(code: string): Promise<AnalysisResult> {
  const { worker, runCode } = useWorkerStore.getState();

  // 워커가 준비되지 않았으면 에러를 반환하거나 빈 결과를 반환할 수 있습니다.
  if (!worker) {
    console.error('정적 분석 실패: 웹 워커가 초기화되지 않았습니다.');
    // 또는 기본 빈 결과를 반환
    return { functions: [], global: { time: 'N/A', space: 'N/A', errors: [] } };
  }

  const currentAnalysisId = ++analysisIdCounter;

  // 워커에 정적 분석 요청
  runCode(code, { task: 'analyze' }, currentAnalysisId);

  // 워커로부터 결과를 기다리는 Promise
  return new Promise((resolve, reject) => {
    const handleMessage = ({ data }: MessageEvent) => {
      // 자신에게 온 메시지가 맞는지 ID로 확인
      if (data.id !== currentAnalysisId) return;

      if (data.type === 'analyze_result') {
        const pyflakesResult = data.data;

        // 기존의 분석 로직을 여기에 통합
        const { functions, global } = extractFunctions(code);
        const funcResults = functions.map((fn) => {
          const { time, space } = estimateComplexity(fn.code.join('\n'));
          const errors = (pyflakesResult || '').split('\n').filter((l) => l.includes(fn.name));
          return { name: fn.name, time, space, errors };
        });
        const { time, space } = estimateComplexity(global);
        const funcNames = functions.map((f) => f.name);
        const globalErrors = (pyflakesResult || '')
          .split('\n')
          .filter((l) => funcNames.every((fn) => !l.includes(fn)) && l.trim() !== '');

        // 리스너 제거 및 Promise 해결
        worker.removeEventListener('message', handleMessage);
        resolve({
          functions: funcResults,
          global: { time, space, errors: globalErrors },
        });
      } else if (data.type === 'error') {
        // 리스너 제거 및 Promise 거부
        worker.removeEventListener('message', handleMessage);
        reject(new Error(data.data));
      }
    };

    worker.addEventListener('message', handleMessage);
  });
}
