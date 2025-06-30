import React from 'react';
import Editor from '@monaco-editor/react';

// EditorPanel이 받을 props 타입을 명확히 정의합니다.
interface EditorPanelProps {
  code: string;
  onCodeChange: (value: string | undefined) => void;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({ code, onCodeChange }) => {
  return (
    <div className="flex-grow bg-[#1e1e1e] flex flex-col">
      <div className="flex justify-between items-center bg-slate-900 px-4 py-2 text-sm text-slate-400 border-b border-slate-700">
        <span className="font-mono">&lt; &gt; solution.py</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
            </svg>
            <span>5/6</span>
          </div>
          <span className="font-mono">00:00</span>
        </div>
      </div>
      <div className="flex-grow">
        <Editor
          height="100%"
          language="python"
          theme="vs-dark"
          value={code}
          onChange={onCodeChange}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 16 },
          }}
        />
      </div>
    </div>
  );
};
export default EditorPanel;
