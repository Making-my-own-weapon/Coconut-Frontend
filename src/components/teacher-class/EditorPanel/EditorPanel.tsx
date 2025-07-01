import React from 'react';
import Editor from '@monaco-editor/react';
import usersIcon from '../../../assets/usersIcon.svg';

interface TeacherEditorPanelProps {
  code: string;
  onCodeChange: (value: string | undefined) => void;
}

const TeacherEditorPanel: React.FC<TeacherEditorPanelProps> = ({ code, onCodeChange }) => {
  return (
    <div className="bg-[#1e1e1e] flex flex-col h-full">
      {/* 에디터 상단 정보 바 (선생님 전용으로 커스터마이즈 가능) */}
      <div className="flex justify-between items-center bg-slate-900 px-4 py-2 text-sm text-slate-400 border-b border-slate-700">
        <span className="font-mono">&lt; &gt; solution.py</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <img src={usersIcon} alt="참가자 수" className="w-4 h-4" />
            <span>교사용</span>
          </div>
          <span className="font-mono">00:00</span>
        </div>
      </div>
      {/* Monaco Editor */}
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

export default TeacherEditorPanel;
