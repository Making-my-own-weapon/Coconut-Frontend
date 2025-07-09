// pyodide를 활용한 정적 분석 모듈
// pyflakes를 pyodide 환경에 설치하고, 파이썬 코드를 분석하는 함수 제공

import { extractFunctions, estimateComplexity } from './analysisUtils';

let pyodide: unknown = null;

export async function initPyodideAndPyflakes() {
  if (pyodide) return pyodide;
  pyodide = await (window as any).loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/',
  });
  await (pyodide as any).loadPackage('micropip');
  await (pyodide as any).runPythonAsync(`
import micropip
await micropip.install('pyflakes')
  `);
  return pyodide;
}

export interface AnalysisResult {
  functions: Array<{ name: string; time: string; space: string; errors: string[] }>;
  global: { time: string; space: string; errors: string[] };
}

export async function analyzePythonCodeBlocks(code: string): Promise<AnalysisResult> {
  await initPyodideAndPyflakes();
  const codeBase64 = btoa(unescape(encodeURIComponent(code)));
  const pyflakesResult: string = await (pyodide as any).runPythonAsync(`
import base64
from pyflakes.api import check
from pyflakes.reporter import Reporter
import io
code = base64.b64decode("${codeBase64}").decode("utf-8")
output = io.StringIO()
reporter = Reporter(output, output)
check(code, '<input>', reporter)
output.getvalue()
  `);
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
  return {
    functions: funcResults,
    global: { time, space, errors: globalErrors },
  };
}
