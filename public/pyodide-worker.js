// This is a web worker, so we can't use ES modules.
// We use `importScripts` to load the Pyodide script.
let pyodide;

async function initializePyodide() {
  self.postMessage({ type: 'status', data: 'Pyodide 로더 스크립트를 가져오는 중...' });

  // 재시도 로직 (최대 3회)
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      importScripts('https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js');
      break; // 성공 시 루프 종료
    } catch (e) {
      retryCount++;
      if (retryCount >= maxRetries) {
        self.postMessage({
          type: 'error',
          data: `Pyodide 스크립트 로드 실패 (${maxRetries}회 시도): ${e.message}`,
        });
        return;
      }
      self.postMessage({
        type: 'status',
        data: `Pyodide 스크립트 로드 재시도 중... (${retryCount}/${maxRetries})`,
      });
      // 1초 대기 후 재시도
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  if (typeof self.loadPyodide !== 'function') {
    self.postMessage({
      type: 'error',
      data: 'loadPyodide 함수를 찾을 수 없습니다. 스크립트가 올바르게 로드되지 않았습니다.',
    });
    return;
  }

  self.postMessage({ type: 'status', data: 'Pyodide를 초기화하는 중입니다...' });
  try {
    pyodide = await self.loadPyodide();
    // 1. Pyflakes 패키지 설치 로직 추가 (재시도 포함)
    self.postMessage({ type: 'status', data: '정적 분석 도구를 설치하는 중입니다...' });

    // micropip 설치 재시도
    let micropipRetryCount = 0;
    while (micropipRetryCount < 3) {
      try {
        await pyodide.loadPackage('micropip');
        break;
      } catch (e) {
        micropipRetryCount++;
        if (micropipRetryCount >= 3) {
          self.postMessage({ type: 'error', data: `micropip 설치 실패: ${e.message}` });
          return;
        }
        self.postMessage({
          type: 'status',
          data: `micropip 설치 재시도 중... (${micropipRetryCount}/3)`,
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    // pyflakes 설치 재시도
    let pyflakesRetryCount = 0;
    while (pyflakesRetryCount < 3) {
      try {
        await pyodide.runPythonAsync(`
          import micropip
          await micropip.install('pyflakes')
        `);
        break;
      } catch (e) {
        pyflakesRetryCount++;
        if (pyflakesRetryCount >= 3) {
          self.postMessage({ type: 'error', data: `pyflakes 설치 실패: ${e.message}` });
          return;
        }
        self.postMessage({
          type: 'status',
          data: `pyflakes 설치 재시도 중... (${pyflakesRetryCount}/3)`,
        });
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
    self.postMessage({ type: 'status', data: 'Pyodide가 준비되었습니다.' });
    self.postMessage({ type: 'ready' });
  } catch (error) {
    self.postMessage({
      type: 'error',
      data: `Pyodide 초기화 실패: ${error.message}\n${error.stack}`,
    });
  }
}

let pyodideReadyPromise = null;

// 새로고침 시 이전 Promise 정리를 위한 초기화 함수
function resetPyodide() {
  pyodide = null;
  pyodideReadyPromise = initializePyodide();
}

// 초기 Promise 생성
pyodideReadyPromise = initializePyodide();

/**
 * Python traceback 문자열에서 가장 의미있는 마지막 에러 라인을 추출합니다.
 * @param {string} fullTraceback - Pyodide가 반환한 전체 에러 메시지
 * @returns {string} 간소화된 에러 메시지
 */
function simplifyTraceback(fullTraceback) {
  if (typeof fullTraceback !== 'string') {
    return String(fullTraceback);
  }
  const lines = fullTraceback.trim().split('\n');
  const errorLineKeywords = [
    'Error:',
    'Exception:',
    'NameError:',
    'SyntaxError:',
    'ValueError:',
    'TypeError:',
    'IndexError:',
    'KeyError:',
    'AttributeError:',
  ];

  // 뒤에서부터 순회하며 키워드가 포함된 첫 번째 라인을 찾습니다.
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (errorLineKeywords.some((keyword) => line.includes(keyword))) {
      return line;
    }
  }

  // 적절한 라인을 찾지 못하면 마지막 라인을 반환
  return lines[lines.length - 1];
}

/**
 * Listens for messages from the main thread.
 * When a message is received, it executes the Python code inside it.
 */
self.onmessage = async (event) => {
  try {
    await pyodideReadyPromise;
  } catch (error) {
    self.postMessage({
      type: 'error',
      data: `Pyodide 초기화 실패: ${error.message}`,
      id: event.data.id,
    });
    return;
  }

  if (!pyodide) {
    self.postMessage({
      type: 'error',
      data: 'Pyodide가 초기화되지 않아 코드를 실행할 수 없습니다.',
      id: event.data.id,
    });
    return;
  }

  const { task, code, id, ...context } = event.data;

  // 2. 'task'에 따라 작업 분기
  if (task === 'analyze') {
    // 정적 분석 작업 수행
    try {
      const pyflakesResult = await pyodide.runPythonAsync(`
        import base64
        from pyflakes.api import check
        from pyflakes.reporter import Reporter
        import io
        
        code_to_check = base64.b64decode("${btoa(unescape(encodeURIComponent(code)))}").decode("utf-8")
        
        output = io.StringIO()
        reporter = Reporter(output, output)
        check(code_to_check, '<input>', reporter)
        output.getvalue()
      `);
      self.postMessage({ type: 'analyze_result', data: pyflakesResult, id });
    } catch (e) {
      self.postMessage({ type: 'error', data: `정적 분석 중 에러: ${e.message}`, id });
    }
    return; // 정적 분석 후 종료
  }

  // --- 기존의 테스트 케이스 실행 작업 ---
  try {
    // 5초 타임아웃 Promise 생성
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('실행 시간 초과 (5초)')), 5000);
    });

    // 실제 코드 실행 Promise
    const executePromise = (async () => {
      for (const key of Object.keys(context)) {
        pyodide.globals.set(key, context[key]);
      }

      // 매번 실행 시, 새로운 StringIO 객체로 입출력 상태를 완전히 리셋합니다.
      pyodide.runPython(`
        import sys, io
        sys.stdout = io.StringIO()
        sys.stderr = io.StringIO()
        # test_input 변수가 존재하면, 그것을 표준 입력으로 설정합니다.
        if 'test_input' in globals():
          sys.stdin = io.StringIO(globals()['test_input'])
      `);

      await pyodide.runPythonAsync(code);

      const stdout = pyodide.runPython('sys.stdout.getvalue()');
      const stderr = pyodide.runPython('sys.stderr.getvalue()');

      return { stdout, stderr };
    })();

    // 타임아웃과 코드 실행을 경쟁시킴
    const { stdout, stderr } = await Promise.race([executePromise, timeoutPromise]);

    if (stderr) {
      const simplifiedError = simplifyTraceback(stderr);
      self.postMessage({ type: 'error', data: simplifiedError, id });
    } else {
      self.postMessage({ type: 'result', data: stdout.trim(), id });
    }
  } catch (error) {
    const simplifiedError = simplifyTraceback(error.message);
    self.postMessage({ type: 'error', data: simplifiedError, id });
  }
};
