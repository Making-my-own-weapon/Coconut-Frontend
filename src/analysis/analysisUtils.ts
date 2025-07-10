export interface FuncBlock {
  name: string;
  code: string[];
}

export function estimateComplexity(code: string) {
  const lines = code.split('\n');
  let maxDepth = 0,
    currentDepth = 0,
    hasRecursion = false;
  const funcNames: string[] = [];
  for (const line of lines) {
    if (/def +([a-zA-Z0-9_]+)/.test(line)) {
      const name = line.match(/def +([a-zA-Z0-9_]+)/)![1];
      funcNames.push(name);
    }
    if (/(for |while )/.test(line)) {
      currentDepth++;
      if (currentDepth > maxDepth) maxDepth = currentDepth;
    }
    if (funcNames.some((fn) => new RegExp(`\\b${fn}\\b`).test(line))) {
      hasRecursion = true;
    }
    if (!/(for |while )/.test(line)) {
      currentDepth = 0;
    }
  }
  let time = 'O(1)';
  if (hasRecursion) time = 'O(2^n)';
  else if (maxDepth === 1) time = 'O(n)';
  else if (maxDepth === 2) time = 'O(n^2)';
  else if (maxDepth >= 3) time = `O(n^${maxDepth})`;
  return { time, space: 'O(1)' };
}

export function extractFunctions(code: string): {
  functions: FuncBlock[];
  global: string;
} {
  const lines = code.split('\n');
  const functions: FuncBlock[] = [];
  let currentFunc: FuncBlock | null = null;
  const globalLines: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const funcMatch = line.match(/^\s*def\s+([a-zA-Z0-9_]+)\s*\(/);
    if (funcMatch) {
      if (currentFunc) functions.push(currentFunc);
      currentFunc = { name: funcMatch[1], code: [line] };
    } else if (currentFunc && (/^\s/.test(line) || line.trim() === '')) {
      currentFunc.code.push(line);
    } else {
      if (currentFunc) {
        functions.push(currentFunc);
        currentFunc = null;
      }
      globalLines.push(line);
    }
  }
  if (currentFunc) functions.push(currentFunc);
  return { functions, global: globalLines.join('\n') };
}
