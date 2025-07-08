/**
 * 학생 페이지의 코드 에디터 UI를 담당하는 컴포넌트입니다.
 */
import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import usersIcon from '../../../assets/usersIcon.svg';
import SvgOverlay from '../../common/SvgOverlay';
import { useSVGStore } from '../../../store/svgStore';

// EditorPanel이 부모로부터 받을 props 타입을 정의합니다.
// 에디터 내용이 변경될 때 호출될 함수 (상위 컴포넌트의 상태를 업데이트)
// 에디터에 표시될 코드 (상위 컴포넌트에서 상태 관리)
interface EditorPanelProps {
  code: string;
  onCodeChange: (value: string | undefined) => void;
  studentName?: string; // 추가: 학생 이름
  disabled?: boolean; // 추가: 에디터 비활성화
  roomId?: string; // 추가: 방 ID
  userId?: string; // 추가: 사용자 ID
  userType?: 'teacher' | 'student'; // 추가: 사용자 타입
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  code,
  onCodeChange,
  studentName,
  disabled,
  roomId,
  userId,
  userType,
}) => {
  // SVGOverlay 관련 상태
  const editorRef = useRef<any>(null);
  const [color, setColor] = useState('#ff0000');
  const { lines, setLines, addLine, clearLines, connectToRoom, leaveRoom } = useSVGStore();
  // 그림판 on/off 상태
  const [showOverlay, setShowOverlay] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);

  // svgStore 연결
  useEffect(() => {
    if (roomId && userId && userType) {
      connectToRoom(roomId, userId, userType);
      return () => {
        leaveRoom();
      };
    }
  }, [roomId, userId, userType, connectToRoom, leaveRoom]);

  // Monaco Editor 스크롤 동기화
  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
    setScrollTop(editor.getScrollTop());
    editor.onDidScrollChange(() => {
      setScrollTop(editor.getScrollTop());
    });
  };

  // SVGOverlay에서 addLine을 사용하도록 핸들러 래핑
  const handleSetLines = (newLines: Array<{ points: [number, number][]; color: string }>) => {
    setLines(newLines);
  };

  const handleClear = () => {
    clearLines();
  };

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

          <span className="font-mono">00:00</span>
          {/* 그림판 토글 버튼: 개발 편의상 항상 보이게 */}
          <button
            className={`ml-2 px-3 py-1 rounded transition ${showOverlay ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
            onClick={() => setShowOverlay((v) => !v)}
          >
            {showOverlay ? '그림판 끄기' : '그림판 켜기'}
          </button>
        </div>
      </div>

      {/* Monaco Editor + SVGOverlay */}
      <div className="flex-grow relative">
        <Editor
          height="100%"
          language="python"
          theme="vs-dark"
          value={code}
          onChange={onCodeChange}
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
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 16 },
            readOnly: disabled,
          }}
          onMount={handleEditorMount}
        />
        <SvgOverlay
          lines={lines}
          setLines={handleSetLines}
          addLine={addLine}
          color={color}
          setColor={setColor}
          readOnly={userType !== 'teacher'}
          show={showOverlay}
          onClear={handleClear}
          editorRef={editorRef}
          scrollTop={scrollTop}
        />
      </div>
    </div>
  );
};
export default EditorPanel;
