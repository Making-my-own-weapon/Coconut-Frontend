/**
 * 학생 페이지의 코드 에디터 UI를 담당하는 컴포넌트입니다.
 */
import React from 'react';
import Editor from '@monaco-editor/react';
import usersIcon from '../../../assets/usersIcon.svg';

// EditorPanel이 부모로부터 받을 props 타입을 정의합니다.
// 에디터 내용이 변경될 때 호출될 함수 (상위 컴포넌트의 상태를 업데이트)
// 에디터에 표시될 코드 (상위 컴포넌트에서 상태 관리)
interface EditorPanelProps {
  code: string;
  onCodeChange: (value: string | undefined) => void;
  studentName?: string; // 추가: 학생 이름
  disabled?: boolean; // 추가: 에디터 비활성화
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  code,
  onCodeChange,
  studentName,
  disabled,
}) => {
  return (
    <div className="bg-[#1e1e1e] flex flex-col h-full">
      {/* 에디터 상단에 위치한 정보 바 */}
      <div className="flex justify-between items-center bg-slate-900 px-4 py-2 text-sm text-slate-400 border-b border-slate-700">
        <span className="font-mono">&lt; &gt; solution.py</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <img src={usersIcon} alt="참가자 수" className="w-4 h-4" />
            <span>{studentName ? studentName : '학생'}</span>
          </div>
        </div>
      </div>

      {/* Monaco Editor가 렌더링되는 영역 */}
      <div className="flex-grow">
        <Editor
          height="100%"
          language="python"
          theme="vs-dark"
          value={code} // 상위에서 받은 코드를 에디터에 표시
          onChange={onCodeChange} // 코드 변경 시 상위의 핸들러 호출
          loading={
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-400 mx-auto mb-2"></div>
                <p className="text-sm">에디터 로딩 중...</p>
              </div>
            </div>
          }
          options={{
            fontSize: 14,
            minimap: { enabled: false }, // 코드 미니맵 비활성화
            scrollBeyondLastLine: false,
            padding: { top: 16 },
            readOnly: disabled, // 추가: 비활성화 시 읽기 전용
          }}
        />
      </div>
    </div>
  );
};
export default EditorPanel;
