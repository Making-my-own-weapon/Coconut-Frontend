import type { FunctionAnalysis, GlobalAnalysis, OverallAnalysis } from './useStaticAnalysis';

interface ComplexityResult {
  functions: FunctionAnalysis[];
  global: GlobalAnalysis;
  overall: OverallAnalysis;
}

// 복잡도 패턴 정의
const COMPLEXITY_PATTERNS = {
  CONSTANT: 'O(1)',
  LINEAR: 'O(n)',
  QUADRATIC: 'O(n²)',
  CUBIC: 'O(n³)',
  LOGARITHMIC: 'O(log n)',
  N_LOG_N: 'O(n log n)',
  EXPONENTIAL: 'O(2ⁿ)',
  FACTORIAL: 'O(n!)',
  LINEAR_SPACE: 'O(n)',
  CONSTANT_SPACE: 'O(1)',
};

// 알고리즘 패턴 인식 규칙
const ALGORITHM_PATTERNS = {
  // 선형 검색
  LINEAR_SEARCH: {
    patterns: [
      /for\s+\w+\s+in\s+range\(len\(\w+\)\)/,
      /for\s+\w+\s+in\s+\w+/,
      /while\s+\w+\s*</,
      /\.index\(/,
      /\.find\(/,
      /\.count\(/,
    ],
    complexity: COMPLEXITY_PATTERNS.LINEAR,
  },

  // 이진 검색
  BINARY_SEARCH: {
    patterns: [
      /while\s+\w+\s*<=\s*\w+/,
      /mid\s*=/,
      /left\s*=\s*mid\s*\+\s*1/,
      /right\s*=\s*mid\s*-\s*1/,
    ],
    complexity: COMPLEXITY_PATTERNS.LOGARITHMIC,
  },

  // 버블 정렬
  BUBBLE_SORT: {
    patterns: [
      /for\s+\w+\s+in\s+range\(len\(\w+\)\)/,
      /for\s+\w+\s+in\s+range\(\w+,\s*len\(\w+\)\)/,
      /if\s+\w+\[\w+\]\s*>\s*\w+\[\w+\]/,
      /\w+\[\w+\],\s*\w+\[\w+\]\s*=\s*\w+\[\w+\],\s*\w+\[\w+\]/,
    ],
    complexity: COMPLEXITY_PATTERNS.QUADRATIC,
  },

  // 퀵 정렬
  QUICK_SORT: {
    patterns: [/pivot\s*=/, /partition\s*\(/, /quicksort\s*\(/, /return\s+quicksort/],
    complexity: COMPLEXITY_PATTERNS.N_LOG_N,
  },

  // 머지 정렬
  MERGE_SORT: {
    patterns: [/merge\s*\(/, /mergesort\s*\(/, /left\s*=\s*\w+\[:mid\]/, /right\s*=\s*\w+\[mid:\]/],
    complexity: COMPLEXITY_PATTERNS.N_LOG_N,
  },

  // 피보나치 (재귀)
  FIBONACCI_RECURSIVE: {
    patterns: [/def\s+\w+\(n\):/, /return\s+\w+\(n-1\)\s*\+\s*\w+\(n-2\)/, /if\s+n\s*<=\s*1:/],
    complexity: COMPLEXITY_PATTERNS.EXPONENTIAL,
  },

  // 피보나치 (동적 프로그래밍)
  FIBONACCI_DP: {
    patterns: [/memo\s*=\s*\{\}/, /if\s+n\s+in\s+memo/, /memo\[n\]\s*=/, /return\s+memo\[n\]/],
    complexity: COMPLEXITY_PATTERNS.LINEAR,
  },

  // 해시맵 사용
  HASHMAP: {
    patterns: [
      /dict\(\)/,
      /\{\}/,
      /in\s+\w+\.keys\(\)/,
      /in\s+\w+\.values\(\)/,
      /\.get\(/,
      /\.setdefault\(/,
    ],
    complexity: COMPLEXITY_PATTERNS.CONSTANT,
  },

  // 스택/큐 사용
  STACK_QUEUE: {
    patterns: [/\.append\(/, /\.pop\(\)/, /\.popleft\(\)/, /from\s+collections\s+import\s+deque/],
    complexity: COMPLEXITY_PATTERNS.CONSTANT,
  },
};

export const analyzeCodeComplexity = async (code: string): Promise<ComplexityResult> => {
  const lines = code.split('\n');
  const functions: FunctionAnalysis[] = [];
  const globalComplexity = COMPLEXITY_PATTERNS.CONSTANT;
  const globalSpaceComplexity = COMPLEXITY_PATTERNS.CONSTANT_SPACE;
  const globalSuggestions: string[] = [];

  // 함수 정의 찾기
  const functionRegex = /def\s+(\w+)\s*\([^)]*\)\s*:/g;
  let match;
  const functionStartLines: number[] = [];
  const functionNames: string[] = [];

  while ((match = functionRegex.exec(code)) !== null) {
    functionNames.push(match[1]);
    functionStartLines.push(code.substring(0, match.index).split('\n').length);
  }

  // 각 함수 분석
  for (let i = 0; i < functionNames.length; i++) {
    const functionName = functionNames[i];
    const startLine = functionStartLines[i];
    const endLine =
      i < functionStartLines.length - 1 ? functionStartLines[i + 1] - 1 : lines.length;

    const functionCode = lines.slice(startLine - 1, endLine).join('\n');
    const functionAnalysis = analyzeFunctionComplexity(functionCode, functionName, startLine);
    functions.push(functionAnalysis);
  }

  // 전역 코드 분석
  const globalCode = extractGlobalCode(code, functionStartLines);
  const globalAnalysis = analyzeGlobalComplexity(globalCode);

  // 전체 복잡도 계산
  const overall = calculateOverallComplexity(functions, globalAnalysis);

  return {
    functions,
    global: {
      timeComplexity: globalAnalysis.timeComplexity,
      spaceComplexity: globalAnalysis.spaceComplexity,
      errors: [],
      suggestions: globalAnalysis.suggestions,
    },
    overall,
  };
};

const analyzeFunctionComplexity = (
  functionCode: string,
  functionName: string,
  lineNumber: number,
): FunctionAnalysis => {
  let timeComplexity = COMPLEXITY_PATTERNS.CONSTANT;
  let spaceComplexity = COMPLEXITY_PATTERNS.CONSTANT_SPACE;
  const suggestions: string[] = [];
  const errors: string[] = [];

  // 알고리즘 패턴 매칭 (우선순위 높음)
  let bestMatch = { complexity: timeComplexity, score: 0 };

  for (const [algorithmName, pattern] of Object.entries(ALGORITHM_PATTERNS)) {
    const matches = pattern.patterns.filter((regex) => regex.test(functionCode));
    const score = matches.length / pattern.patterns.length;

    if (score >= 0.7 && score > bestMatch.score) {
      // 70% 이상 매칭하고 더 높은 점수
      bestMatch = { complexity: pattern.complexity, score };
    }
  }

  if (bestMatch.score > 0) {
    timeComplexity = bestMatch.complexity;
  }

  // 중첩 루프 검사
  const nestedLoops = countNestedLoops(functionCode);

  // 중첩 루프가 더 높으면 항상 우선 적용
  if (nestedLoops >= 3) {
    timeComplexity = COMPLEXITY_PATTERNS.CUBIC;
    suggestions.push('중첩 루프가 3개 이상입니다. 알고리즘을 최적화하는 것을 고려해보세요.');
  } else if (nestedLoops === 2) {
    timeComplexity = COMPLEXITY_PATTERNS.QUADRATIC;
    suggestions.push(
      '중첩 루프가 2개입니다. 해시맵이나 다른 자료구조를 사용하여 O(n)으로 개선할 수 있습니다.',
    );
  } else if (nestedLoops === 1) {
    timeComplexity = COMPLEXITY_PATTERNS.LINEAR;
  }

  // 재귀 함수 검사
  if (functionCode.includes(functionName + '(') && functionCode.includes('return')) {
    const recursiveCalls = (functionCode.match(new RegExp(`${functionName}\\s*\\(`, 'g')) || [])
      .length;
    if (recursiveCalls > 1) {
      if (timeComplexity === COMPLEXITY_PATTERNS.CONSTANT) {
        timeComplexity = COMPLEXITY_PATTERNS.EXPONENTIAL;
      }
      suggestions.push('재귀 함수입니다. 메모이제이션을 사용하여 성능을 개선할 수 있습니다.');
    }
  }

  // 공간 복잡도 계산
  spaceComplexity = calculateSpaceComplexity(functionCode);

  return {
    name: functionName,
    timeComplexity,
    spaceComplexity,
    errors,
    suggestions,
    lineNumber,
  };
};

const analyzeGlobalComplexity = (globalCode: string): GlobalAnalysis => {
  let timeComplexity = COMPLEXITY_PATTERNS.CONSTANT;
  let spaceComplexity = COMPLEXITY_PATTERNS.CONSTANT_SPACE;
  const suggestions: string[] = [];

  // 전역 코드에서 중첩 루프 검사
  const nestedLoops = countNestedLoops(globalCode);
  if (nestedLoops >= 3) {
    timeComplexity = COMPLEXITY_PATTERNS.CUBIC;
    suggestions.push(
      '전역 코드에 중첩 루프가 3개 이상입니다. 알고리즘을 최적화하는 것을 고려해보세요.',
    );
  } else if (nestedLoops === 2) {
    timeComplexity = COMPLEXITY_PATTERNS.QUADRATIC;
    suggestions.push(
      '전역 코드에 중첩 루프가 2개입니다. 해시맵이나 다른 자료구조를 사용하여 O(n)으로 개선할 수 있습니다.',
    );
  } else if (nestedLoops === 1) {
    timeComplexity = COMPLEXITY_PATTERNS.LINEAR;
  }

  // 자료구조 사용 검사(기존 코드 유지)
  if (globalCode.includes('[]') || globalCode.includes('list(')) {
    spaceComplexity = COMPLEXITY_PATTERNS.LINEAR_SPACE;
  }

  return {
    timeComplexity,
    spaceComplexity,
    errors: [],
    suggestions,
  };
};

const calculateOverallComplexity = (
  functions: FunctionAnalysis[],
  globalAnalysis: GlobalAnalysis,
): OverallAnalysis => {
  let worstTimeComplexity = globalAnalysis.timeComplexity;
  let worstSpaceComplexity = globalAnalysis.spaceComplexity;

  // 함수들 중 가장 나쁜 복잡도 찾기
  for (const func of functions) {
    if (compareComplexity(func.timeComplexity, worstTimeComplexity) > 0) {
      worstTimeComplexity = func.timeComplexity;
    }
    if (compareComplexity(func.spaceComplexity, worstSpaceComplexity) > 0) {
      worstSpaceComplexity = func.spaceComplexity;
    }
  }

  return {
    worstTimeComplexity,
    worstSpaceComplexity,
    totalErrors: functions.reduce((sum, func) => sum + func.errors.length, 0),
    totalFunctions: functions.length,
    codeQuality: 'good', // 기본값, 실제로는 calculateCodeQuality에서 계산됨
  };
};

const countNestedLoops = (code: string): number => {
  const lines = code.split('\n');
  let maxNesting = 0;
  const indentStack: number[] = [];
  let currentNesting = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;

    const currentIndent = line.length - line.trimStart().length;

    // 스택에서 현재 들여쓰기보다 큰 값은 pop
    while (indentStack.length > 0 && indentStack[indentStack.length - 1] >= currentIndent) {
      indentStack.pop();
      currentNesting--;
    }

    if (trimmedLine.startsWith('for ') || trimmedLine.startsWith('while ')) {
      indentStack.push(currentIndent);
      currentNesting++;
      maxNesting = Math.max(maxNesting, currentNesting);
    }
  }

  return maxNesting;
};

const calculateSpaceComplexity = (code: string): string => {
  // 리스트, 딕셔너리, 세트 등의 동적 자료구조 사용 검사
  const dynamicStructures = [/\[\]/g, /list\(/g, /dict\(/g, /set\(/g, /\.append\(/g, /\.extend\(/g];

  // 중첩 루프 안에서 append/extend가 몇 중 루프에 있는지 판정
  const lines = code.split('\n');
  let maxAppendNesting = 0;
  let currentNesting = 0;
  let previousIndent = 0;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;
    const currentIndent = line.length - line.trimStart().length;
    if (currentIndent < previousIndent) {
      const indentDiff = Math.floor((previousIndent - currentIndent) / 4);
      currentNesting = Math.max(0, currentNesting - indentDiff);
    }
    if (trimmedLine.startsWith('for ') || trimmedLine.startsWith('while ')) {
      currentNesting++;
    }
    if (/(\.append\(|\.extend\()/g.test(trimmedLine)) {
      maxAppendNesting = Math.max(maxAppendNesting, currentNesting);
    }
    previousIndent = currentIndent;
  }

  if (maxAppendNesting >= 3) return 'O(n³)';
  if (maxAppendNesting === 2) return 'O(n²)';
  if (maxAppendNesting === 1) return 'O(n)';

  // 기존 방식(append/extend 등 동적 자료구조 사용)
  let totalUsage = 0;
  for (const pattern of dynamicStructures) {
    totalUsage += (code.match(pattern) || []).length;
  }
  if (totalUsage > 0) {
    return 'O(n)';
  }
  return 'O(1)';
};

const extractGlobalCode = (code: string, functionStartLines: number[]): string => {
  const lines = code.split('\n');
  const globalLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const lineNumber = i + 1;
    if (!functionStartLines.includes(lineNumber)) {
      globalLines.push(lines[i]);
    }
  }

  return globalLines.join('\n');
};

const compareComplexity = (complexity1: string, complexity2: string): number => {
  const complexityOrder = [
    COMPLEXITY_PATTERNS.CONSTANT,
    COMPLEXITY_PATTERNS.LOGARITHMIC,
    COMPLEXITY_PATTERNS.LINEAR,
    COMPLEXITY_PATTERNS.N_LOG_N,
    COMPLEXITY_PATTERNS.QUADRATIC,
    COMPLEXITY_PATTERNS.CUBIC,
    COMPLEXITY_PATTERNS.EXPONENTIAL,
    COMPLEXITY_PATTERNS.FACTORIAL,
  ];

  const index1 = complexityOrder.indexOf(complexity1);
  const index2 = complexityOrder.indexOf(complexity2);

  if (index1 === -1 || index2 === -1) return 0;
  return index1 - index2;
};
