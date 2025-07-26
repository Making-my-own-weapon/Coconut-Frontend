import { useWorkerStore } from '../store/workerStore';

// workerStore의 워커를 재사용하기 위한 pending 요청 관리
const pending: Record<string, (result: string[] | Error) => void> = {};

// 워커 메시지 핸들러가 설정되었는지 확인
let isHandlerSet = false;

// workerStore의 워커에 syntax checker 메시지 핸들러 추가
const setupSyntaxHandler = () => {
  if (isHandlerSet) return;

  const store = useWorkerStore.getState();
  if (!store.worker) {
    // 워커가 없으면 준비될 때까지 대기 후 다시 시도 (초기화는 하지 않음)
    setTimeout(setupSyntaxHandler, 100);
    return;
  }

  // 기존 onmessage 핸들러 백업
  const originalOnMessage = store.worker.onmessage;

  // 새로운 메시지 핸들러 설정
  store.worker.onmessage = (event: MessageEvent) => {
    const { id, type, data } = event.data;

    // syntax checker 관련 메시지 처리 (안전한 타입 체크 추가)
    if (id && typeof id === 'string' && id.startsWith('syntax-') && pending[id]) {
      if (type === 'analyze_result') {
        const pyflakesOutput = data;
        if (!pyflakesOutput || pyflakesOutput.trim() === '') {
          pending[id]([]);
        } else {
          const errors = parsePyflakesOutput(pyflakesOutput);
          pending[id](errors);
        }
      } else if (type === 'error') {
        pending[id](new Error(data));
      }
      delete pending[id];
    } else {
      // 기존 핸들러 호출 (workerStore의 원래 로직)
      if (originalOnMessage && store.worker) {
        originalOnMessage.call(store.worker, event);
      }
    }
  };

  isHandlerSet = true;
};

export const checkSyntaxErrors = async (code: string): Promise<string[]> => {
  if (!code.trim()) {
    return [];
  }

  const store = useWorkerStore.getState();

  // 워커가 준비되지 않았으면 준비될 때까지 대기 (초기화는 하지 않음)
  if (!store.isReady) {
    await new Promise<void>((resolve) => {
      const checkReady = () => {
        const currentStore = useWorkerStore.getState();
        if (currentStore.isReady) {
          resolve();
        } else {
          setTimeout(checkReady, 100);
        }
      };
      checkReady();
    });
  }

  // syntax checker 메시지 핸들러 설정
  setupSyntaxHandler();

  return new Promise((resolve, reject) => {
    const id = 'syntax-' + Math.random().toString(36).slice(2);
    const timeoutId = setTimeout(() => {
      delete pending[id];
      reject(new Error('문법 검사 시간 초과'));
    }, 10000);

    pending[id] = (result) => {
      clearTimeout(timeoutId);
      if (result instanceof Error) reject(result);
      else resolve(result);
    };

    // workerStore의 워커에 메시지 전송
    const currentStore = useWorkerStore.getState();
    currentStore.worker?.postMessage({
      task: 'analyze',
      code,
      id,
    });
  });
};

// pyflakes 출력을 파싱하여 오류 메시지 배열로 변환
const parsePyflakesOutput = (output: string): string[] => {
  const lines = output.split('\n').filter((line) => line.trim());
  const errors: string[] = [];

  for (const line of lines) {
    // pyflakes 출력 형식: <filename>:<line>: <message>
    const match = line.match(/^[^:]+:(\d+):\s*(.+)$/);
    if (match) {
      const lineNumber = match[1];
      const message = match[2];
      errors.push(`라인 ${lineNumber}: ${message}`);
    } else {
      // 형식이 맞지 않는 경우 전체 라인을 오류로 추가
      errors.push(line);
    }
  }

  return errors;
};

// 기본 문법 검사 (Pyodide를 사용할 수 없는 경우)
const performBasicSyntaxCheck = (code: string): string[] => {
  const errors: string[] = [];

  // 기본적인 Python 문법 오류 검사
  const lines = code.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // 들여쓰기 검사
    if (line.trim() && !line.startsWith(' ') && !line.startsWith('\t')) {
      // 첫 번째 레벨이 아닌 경우 들여쓰기 필요
      if (i > 0 && lines[i - 1].trim() && lines[i - 1].endsWith(':')) {
        if (!line.startsWith('    ') && !line.startsWith('\t')) {
          errors.push(
            `라인 ${lineNumber}: 들여쓰기 오류 - 콜론(:) 다음에는 들여쓰기가 필요합니다.`,
          );
        }
      }
    }

    // 괄호 균형 검사
    const openParens = (line.match(/\(/g) || []).length;
    const closeParens = (line.match(/\)/g) || []).length;
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;
    const openBrackets = (line.match(/\[/g) || []).length;
    const closeBrackets = (line.match(/\]/g) || []).length;

    if (openParens !== closeParens) {
      errors.push(
        `라인 ${lineNumber}: 괄호 균형 오류 - 열린 괄호: ${openParens}, 닫힌 괄호: ${closeParens}`,
      );
    }
    if (openBraces !== closeBraces) {
      errors.push(
        `라인 ${lineNumber}: 중괄호 균형 오류 - 열린 중괄호: ${openBraces}, 닫힌 중괄호: ${closeBraces}`,
      );
    }
    if (openBrackets !== closeBrackets) {
      errors.push(
        `라인 ${lineNumber}: 대괄호 균형 오류 - 열린 대괄호: ${openBrackets}, 닫힌 대괄호: ${closeBrackets}`,
      );
    }

    // 문자열 따옴표 균형 검사
    const singleQuotes = (line.match(/'/g) || []).length;
    const doubleQuotes = (line.match(/"/g) || []).length;

    if (singleQuotes % 2 !== 0) {
      errors.push(`라인 ${lineNumber}: 작은따옴표 균형 오류`);
    }
    if (doubleQuotes % 2 !== 0) {
      errors.push(`라인 ${lineNumber}: 큰따옴표 균형 오류`);
    }

    // 예약어 오류 검사
    const reservedWords = [
      'and',
      'as',
      'assert',
      'break',
      'class',
      'continue',
      'def',
      'del',
      'elif',
      'else',
      'except',
      'finally',
      'for',
      'from',
      'global',
      'if',
      'import',
      'in',
      'is',
      'lambda',
      'nonlocal',
      'not',
      'or',
      'pass',
      'raise',
      'return',
      'try',
      'while',
      'with',
      'yield',
    ];

    const words = line.split(/\s+/);
    for (const word of words) {
      const cleanWord = word.replace(/[^\w]/g, '');
      if (reservedWords.includes(cleanWord) && !line.includes('def ') && !line.includes('class ')) {
        // 함수나 클래스 정의가 아닌 경우에만 오류로 처리
        if (line.includes('=') || line.includes('(')) {
          errors.push(`라인 ${lineNumber}: 예약어 '${cleanWord}'를 변수명으로 사용할 수 없습니다.`);
        }
      }
    }
  }

  // 전체 코드 레벨 검사
  const functionDefs = (code.match(/def\s+\w+\s*\(/g) || []).length;
  const functionCalls = (code.match(/\w+\s*\(/g) || []).length - functionDefs;

  // 정의되지 않은 함수 호출 가능성 검사 (간단한 검사)
  if (functionCalls > functionDefs * 2) {
    errors.push('정의되지 않은 함수를 호출할 가능성이 있습니다.');
  }

  return errors;
};

// 추가적인 코드 품질 검사
export const performCodeQualityCheck = (code: string): string[] => {
  const warnings: string[] = [];
  const lines = code.split('\n');

  // 긴 함수 검사
  let currentFunctionLines = 0;
  let inFunction = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('def ')) {
      if (inFunction && currentFunctionLines > 20) {
        warnings.push(
          `함수가 너무 깁니다 (${currentFunctionLines}줄). 함수를 더 작은 단위로 분리하는 것을 고려해보세요.`,
        );
      }
      inFunction = true;
      currentFunctionLines = 0;
    } else if (inFunction && line.trim()) {
      currentFunctionLines++;
    }
  }

  // 마지막 함수 검사
  if (inFunction && currentFunctionLines > 20) {
    warnings.push(
      `함수가 너무 깁니다 (${currentFunctionLines}줄). 함수를 더 작은 단위로 분리하는 것을 고려해보세요.`,
    );
  }

  // 매직 넘버 검사
  const magicNumbers = code.match(/\b\d{4,}\b/g);
  if (magicNumbers) {
    warnings.push('매직 넘버가 사용되었습니다. 상수로 정의하는 것을 고려해보세요.');
  }

  // 하드코딩된 문자열 검사
  const hardcodedStrings = code.match(/"[^"]{20,}"/g);
  if (hardcodedStrings) {
    warnings.push('긴 하드코딩된 문자열이 있습니다. 상수로 정의하는 것을 고려해보세요.');
  }

  return warnings;
};
