/**
 * Pyodide 인스턴스의 주요 메서드 타입을 정의합니다.
 * 'any' 타입을 피하고 코드 자동 완성을 지원하기 위해 사용됩니다.
 */
export interface Pyodide {
  runPythonAsync: (code: string) => Promise<any>;
  globals: {
    set: (name: string, value: any) => void;
  };
  setStdout: (options: any) => void;
  runPython: (code: string) => any;
}

/**
 * 전역 Window 객체에 loadPyodide 함수 타입을 선언합니다.
 * 이를 통해 TypeScript가 window.loadPyodide를 인식할 수 있습니다.
 */
declare global {
  interface Window {
    loadPyodide: (config?: any) => Promise<Pyodide>;
  }
}
