/**
 * 학생 페이지의 코드 에디터 UI를 담당하는 컴포넌트입니다.
 */
import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import usersIcon from '../../../assets/usersIcon.svg';
import SvgOverlay from '../../common/SvgOverlay';

interface SVGLine {
  points: [number, number][];
  color: string;
}

// Monaco Editor 타입 정의
// (declare global 생략 가능)

interface EditorPanelProps {
  code: string;
  onCodeChange: (value: string | undefined) => void;
  studentName?: string;
  disabled?: boolean;
  otherCursor?: { lineNumber: number; column: number; problemId: number | null } | null;
  onCursorChange?: (position: {
    lineNumber: number;
    column: number;
    problemId: number | null;
  }) => void;
  roomId?: string;
  userId?: string;
  role?: 'teacher' | 'student';
  svgLines: SVGLine[];
  onAddSVGLine: (line: SVGLine) => void;
  onClearSVGLines: () => void;
  onSetSVGLines: (lines: SVGLine[]) => void;
  problemId: number | null; // ← 추가
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  code,
  onCodeChange,
  studentName,
  disabled,
  otherCursor,
  onCursorChange,
  roomId,
  userId,
  role,
  svgLines,
  onAddSVGLine,
  onClearSVGLines,
  onSetSVGLines,
  problemId, // ← 추가
}) => {
  const editorRef = useRef<any>(null);
  const decorationIds = useRef<string[]>([]);
  const monacoRef = useRef<any>(null);
  const [color, setColor] = useState('#ff0000');
  const [showOverlay, setShowOverlay] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);

  // Editor mount에서 그림판+커서 모두 처리
  function handleEditorDidMount(editor: any, monaco: any) {
    editorRef.current = editor;
    monacoRef.current = monaco;
    setScrollTop(editor.getScrollTop());
    editor.onDidScrollChange(() => {
      setScrollTop(editor.getScrollTop());
    });
    // 커서 위치 변경 이벤트 리스너 추가
    if (onCursorChange) {
      editor.onDidChangeCursorPosition((e: any) => {
        onCursorChange({
          lineNumber: e.position.lineNumber,
          column: e.position.column,
          problemId, // ← 반드시 포함
        });
      });
    }
  }

  // 커서 동기화(Decoration, 라벨)
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    // 문제 ID가 다르면 커서 표시 X
    if (!otherCursor || otherCursor.problemId !== problemId) return;
    try {
      decorationIds.current = editorRef.current.deltaDecorations(decorationIds.current, [
        {
          range: new monacoRef.current.Range(
            otherCursor.lineNumber,
            otherCursor.column,
            otherCursor.lineNumber,
            otherCursor.column + 1,
          ),
          options: {
            className: 'remote-cursor',
            stickiness: 1,
          },
        },
      ]);
    } catch (e) {
      console.error(e);
    }
    const widgetId = 'remote-cursor-label-widget';
    const labelDom = document.createElement('div');
    labelDom.className = 'remote-cursor-label';
    labelDom.textContent = '선생님';
    const widget = {
      getId: () => widgetId,
      getDomNode: () => labelDom,
      getPosition: () => ({
        position: {
          lineNumber: otherCursor.lineNumber,
          column: otherCursor.column,
        },
        preference: [monacoRef.current.editor.ContentWidgetPositionPreference.ABOVE],
      }),
    };
    editorRef.current.addContentWidget(widget);
    return () => {
      editorRef.current.removeContentWidget(widget);
    };
  }, [otherCursor, monacoRef, studentName, problemId]);

  // 그림판 핸들러
  const handleSetLines = (newLines: Array<{ points: [number, number][]; color: string }>) => {
    onSetSVGLines(newLines);
  };
  const handleClear = () => {
    onClearSVGLines();
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
          {/* 그림판 토글 버튼: 학생은 읽기 전용이지만 보기 위해 필요 */}
          <button
            className={`px-3 py-1 rounded transition ${showOverlay ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
            onClick={() => setShowOverlay((v) => !v)}
          >
            {showOverlay ? '그림판 끄기' : '그림판 보기'}
          </button>
        </div>
      </div>
      {/* Monaco Editor + SvgOverlay */}
      <div className="flex-grow relative">
        <Editor
          height="100%"
          language="python"
          theme="vs-dark"
          value={code}
          onChange={onCodeChange}
          onMount={handleEditorDidMount}
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
        />
        <SvgOverlay
          lines={svgLines}
          setLines={handleSetLines}
          addLine={onAddSVGLine}
          color={color}
          setColor={setColor}
          readOnly={role !== 'teacher'}
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
