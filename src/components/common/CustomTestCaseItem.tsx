import React, { useState } from 'react';
import useAutoResizeTextarea from './useAutoResizeTextarea';

interface CustomTestCaseItemProps {
  input: string;
  expectedOutput: string;
  onInputChange: (v: string) => void;
  onExpectedChange: (v: string) => void;
  onRemove: () => void;
  userCode: string;
  pyodide: any;
  isPyodideLoading: boolean;
  playIcon: string | React.ReactNode;
  SvgIcon?: React.ComponentType<any>; // 학생/선생님 playIcon 타입 차이 대응
}

const CustomTestCaseItem: React.FC<CustomTestCaseItemProps> = ({
  input,
  expectedOutput,
  onInputChange,
  onExpectedChange,
  onRemove,
  userCode,
  pyodide,
  isPyodideLoading,
  playIcon,
  SvgIcon,
}) => {
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const handleRunTest = async () => {
    if (!pyodide || !userCode) return;
    setIsRunning(true);
    setOutput('');
    setError('');
    setHasRun(true);
    try {
      pyodide.setStdout({});
      pyodide.runPython('import sys; sys.stdout.flush()');
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('실행 시간 초과 (5초)')), 5000);
      });
      const executePromise = (async () => {
        pyodide.globals.set('test_input', input);
        pyodide.runPython(`import sys; from io import StringIO; sys.stdin = StringIO(test_input)`);
        let capturedOutput = '';
        pyodide.setStdout({
          batched: (out: string) => {
            capturedOutput += out + '\n';
          },
        });
        await pyodide.runPythonAsync(userCode);
        return capturedOutput.trim();
      })();
      const result = await Promise.race([executePromise, timeoutPromise]);
      setOutput(result as string);
    } catch (e: any) {
      let errorMessage = '';
      if (e instanceof Error) {
        if (e.message === '실행 시간 초과 (5초)') {
          errorMessage = e.message;
        } else {
          const lines = e.message.split('\n');
          const lastErrorLine = lines.find(
            (line) =>
              line.includes('Error:') ||
              line.includes('Exception:') ||
              line.trim().startsWith('NameError:') ||
              line.trim().startsWith('SyntaxError:') ||
              line.trim().startsWith('ValueError:') ||
              line.trim().startsWith('TypeError:'),
          );
          errorMessage = lastErrorLine ? lastErrorLine.trim() : e.message;
        }
      } else {
        errorMessage = String(e);
      }
      setError(errorMessage);
    } finally {
      try {
        pyodide.setStdout({});
        pyodide.runPython('import sys; sys.stdout.flush(); sys.stdin = sys.__stdin__');
      } catch {}
      setIsRunning(false);
    }
  };

  const isCorrect = output.trim() === expectedOutput.trim();
  const inputRef = useAutoResizeTextarea(input);
  const expectedRef = useAutoResizeTextarea(expectedOutput);
  const outputRef = useAutoResizeTextarea(output);

  return (
    <div className="bg-slate-700 p-3 rounded-md relative mb-0">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-semibold text-white text-sm">Custom Test Case</h4>
        <button
          onClick={handleRunTest}
          disabled={isRunning || isPyodideLoading || !pyodide}
          className="disabled:opacity-50"
        >
          {isRunning ? (
            SvgIcon ? (
              <SvgIcon src={playIcon} className="w-5 h-5 animate-spin" />
            ) : (
              <img src={playIcon as string} alt="실행 중" className="w-5 h-5 animate-spin" />
            )
          ) : SvgIcon ? (
            <SvgIcon src={playIcon} className="w-5 h-5 text-slate-400 hover:text-white" />
          ) : (
            <img
              src={playIcon as string}
              alt="실행"
              className="w-5 h-5 text-slate-400 hover:text-white"
            />
          )}
        </button>
      </div>
      <div className="text-xs font-mono text-slate-400 space-y-1">
        <p className="mb-2">
          <strong>입력:</strong>
          <textarea
            className="mt-1 bg-slate-800 text-white rounded px-1 py-0.5 w-full min-h-8 resize-none overflow-hidden"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            rows={1}
            ref={inputRef}
          />
        </p>
        <p className="mb-2">
          <strong>예상 출력:</strong>
          <textarea
            className="mt-1 bg-slate-800 text-white rounded px-1 py-0.5 w-full min-h-8 resize-none overflow-hidden"
            value={expectedOutput}
            onChange={(e) => onExpectedChange(e.target.value)}
            rows={1}
            ref={expectedRef}
          />
        </p>
        {hasRun && (
          <p className="mb-2">
            <strong>실제 출력:</strong>
            <textarea
              className="mt-1 bg-slate-800 text-white rounded px-1 py-0.5 w-full min-h-8 resize-none overflow-hidden"
              value={output}
              readOnly
              ref={outputRef}
              rows={1}
            />
            {output === '' && <span className="ml-2">(출력 없음)</span>}
          </p>
        )}
        <div className="flex items-center justify-between mt-1">
          <span
            className={
              hasRun && output !== '' ? (isCorrect ? 'text-green-400' : 'text-red-400') : ''
            }
          >
            {hasRun && output !== '' ? (isCorrect ? '정답' : '오답') : ''}
          </span>
          <button
            onClick={onRemove}
            className="text-xl text-slate-400 hover:text-red-400 w-6 h-6 flex items-center justify-center"
            title="삭제"
            type="button"
          >
            -
          </button>
        </div>
        {error && (
          <p className="text-red-400">
            <strong>에러:</strong> {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default CustomTestCaseItem;
