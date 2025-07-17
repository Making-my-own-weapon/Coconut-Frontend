import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import usersIcon from '../../../assets/usersIcon.svg';
import SvgOverlay from '../../common/SvgOverlay';

interface SVGLine {
  points: [number, number][];
  color: string;
}

interface TeacherEditorPanelProps {
  code: string;
  onCodeChange: (value: string | undefined) => void;
  selectedStudentId?: number | null;
  studentName?: string;
  onClickReturnToTeacher?: () => void;
  isConnecting?: boolean;
  otherCursor?: { lineNumber: number; column: number } | null;
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

const TeacherEditorPanel: React.FC<TeacherEditorPanelProps> = ({
  code,
  onCodeChange,
  selectedStudentId,
  studentName,
  onClickReturnToTeacher,
  isConnecting = false,
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
    try {
      decorationIds.current = editorRef.current.deltaDecorations(
        decorationIds.current,
        otherCursor
          ? [
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
            ]
          : [],
      );
    } catch (e) {
      console.error(e);
    }
    if (!otherCursor) return;
    const widgetId = 'remote-cursor-label-widget';
    const labelDom = document.createElement('div');
    labelDom.className = 'remote-cursor-label';
    labelDom.textContent = studentName || '학생';
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
  }, [otherCursor, monacoRef, studentName]);

  // 그림판 핸들러
  const handleSetLines = (newLines: Array<{ points: [number, number][]; color: string }>) => {
    onSetSVGLines(newLines);
  };
  const handleClear = () => {
    onClearSVGLines();
  };

  return (
    <div className="bg-[#1e1e1e] flex flex-col h-full">
      {/* 에디터 상단 정보 바 */}
      <div className="flex justify-between items-center bg-slate-900 px-4 py-2 text-sm text-slate-400 border-b border-slate-700">
        <span className="font-mono">&lt; &gt; solution.py</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <img src={usersIcon} alt="참가자 수" className="w-4 h-4" />
            <span>
              {selectedStudentId === null || selectedStudentId === undefined
                ? '내 코드 에디터'
                : `${studentName || selectedStudentId} 에디터`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {/* 그림판 토글 버튼: 항상 보이게 */}
            <button
              className={`px-3 py-1 rounded transition ${showOverlay ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
              onClick={() => setShowOverlay((v) => !v)}
            >
              {showOverlay ? '그림판 끄기' : '그림판 켜기'}
            </button>
          </div>
        </div>
      </div>
      {/* Monaco Editor + SvgOverlay */}
      <div className="flex-grow relative">
        {isConnecting ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-3"></div>
              <p className="text-sm">학생과 연결 중...</p>
              <p className="text-xs text-slate-500 mt-1">잠시만 기다려주세요</p>
            </div>
          </div>
        ) : (
          <>
            <Editor
              height="100%"
              language="python"
              theme="vs-dark"
              value={code}
              onChange={onCodeChange}
              onMount={handleEditorDidMount}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16 },
              }}
            />
            <SvgOverlay
              lines={svgLines}
              setLines={handleSetLines}
              addLine={onAddSVGLine}
              color={color}
              setColor={setColor}
              readOnly={!showOverlay ? true : false}
              show={showOverlay}
              onClear={handleClear}
              editorRef={editorRef}
              scrollTop={scrollTop}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherEditorPanel;
