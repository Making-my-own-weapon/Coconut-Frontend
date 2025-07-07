import React from 'react';
import Editor from '@monaco-editor/react';
import usersIcon from '../../../assets/usersIcon.svg';

interface TeacherEditorPanelProps {
  code: string;
  onCodeChange: (value: string | undefined) => void;
  selectedStudentId?: number | null; // 추가: 현재 선택된 학생 id
  studentName?: string; // 추가: 학생 이름
  onClickReturnToTeacher?: () => void; // 추가: 내 코드로 전환 버튼 클릭 핸들러
  isConnecting?: boolean; // 추가: 학생 연결 중 상태
}

const TeacherEditorPanel: React.FC<TeacherEditorPanelProps> = ({
  code,
  onCodeChange,
  selectedStudentId,
  studentName,
  onClickReturnToTeacher,
  isConnecting = false,
}) => {
  return (
    <div className="bg-[#1e1e1e] flex flex-col h-full">
      {/* 에디터 상단 정보 바 (선생님/학생 모드 표시) */}
      <div className="flex justify-between items-center bg-slate-900 px-4 py-2 text-sm text-slate-400 border-b border-slate-700">
        <span className="font-mono">&lt; &gt; solution.py</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <img src={usersIcon} alt="참가자 수" className="w-4 h-4" />
            <span>
              {selectedStudentId === null || selectedStudentId === undefined
                ? '선생님 에디터'
                : `학생 ${studentName || selectedStudentId} 에디터`}
            </span>
          </div>
          <span className="font-mono">00:00</span>
          {/* 학생 모드일 때만 내 코드로 전환 버튼 노출 */}
          {selectedStudentId !== null && onClickReturnToTeacher && (
            <button
              className="ml-2 px-3 py- bg-blue-600 text-white rounded hover:bg-blue-500 transition"
              onClick={onClickReturnToTeacher}
            >
              선생님 에디터
            </button>
          )}
        </div>
      </div>
      {/* Monaco Editor */}
      <div className="flex-grow">
        {isConnecting ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-3"></div>
              <p className="text-sm">학생과 연결 중...</p>
              <p className="text-xs text-slate-500 mt-1">잠시만 기다려주세요</p>
            </div>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default TeacherEditorPanel;
