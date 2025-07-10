// This is a web worker, so we can't use ES modules.
// We use `importScripts` to load the Pyodide script.
let pyodide;

async function initializePyodide() {
  self.postMessage({ type: 'status', data: 'Pyodide 로더 스크립트를 가져오는 중...' });
  try {
    importScripts('https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js');
  } catch (e) {
    self.postMessage({ type: 'error', data: `Pyodide 스크립트 로드 실패: ${e.message}` });
    return; // 스크립트 로드 실패 시 함수 종료
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
    self.postMessage({ type: 'status', data: 'Pyodide가 준비되었습니다.' });
    self.postMessage({ type: 'ready' });
  } catch (error) {
    self.postMessage({
      type: 'error',
      data: `Pyodide 초기화 실패: ${error.message}\n${error.stack}`,
    });
  }
}

const pyodideReadyPromise = initializePyodide();

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
  await pyodideReadyPromise;

  if (!pyodide) {
    self.postMessage({
      type: 'error',
      data: 'Pyodide가 초기화되지 않아 코드를 실행할 수 없습니다.',
      id: event.data.id,
    });
    return;
  }

  const { code, id, ...context } = event.data;

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
