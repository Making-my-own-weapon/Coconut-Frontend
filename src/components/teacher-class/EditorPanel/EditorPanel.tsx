import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import usersIcon from '../../../assets/usersIcon.svg';
import SvgOverlay from '../../common/SvgOverlay';
import * as monaco from 'monaco-editor';
import {
  diff_match_patch as DiffMatchPatch,
  DIFF_DELETE,
  DIFF_INSERT,
  DIFF_EQUAL,
} from 'diff-match-patch';

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
  isAnalysisPanelOpen?: boolean; // 분석 패널 열림 상태 추가
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
  isAnalysisPanelOpen = false, // 분석 패널 열림 상태 추가
}) => {
  const editorRef = useRef<any>(null);
  const decorationIds = useRef<string[]>([]);
  const [color, setColor] = useState('#ff0000');
  const [showOverlay, setShowOverlay] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const isRemoteUpdating = useRef(false);
  const normalizeEOL = (s: string = '') => s.replace(/\r\n?/g, '\n');
  const initialCodeRef = useRef(code); // mount 시 고정

  // Editor mount에서 그림판+커서 모두 처리
  function handleEditorDidMount(editor: any) {
    editorRef.current = editor;

    // EOL 통일
    const model = editor.getModel();
    if (model) {
      model.setEOL(monaco.editor.EndOfLineSequence.LF);
    }

    setScrollTop(editor.getScrollTop());
    editor.onDidScrollChange(() => {
      setScrollTop(editor.getScrollTop());
    });
    // 커서 위치 변경 이벤트 리스너 추가
    if (onCursorChange) {
      editor.onDidChangeCursorPosition((e: any) => {
        // 네트워크로 인한 업데이트 중엔 무시
        if (!isRemoteUpdating.current) {
          onCursorChange({
            lineNumber: e.position.lineNumber,
            column: e.position.column,
            problemId,
          });
        }
      });
    }
  }

  // 커서 동기화(Decoration, 라벨)
  useEffect(() => {
    if (!editorRef.current) return;
    // 문제 ID가 다르면 커서 표시 X (null 체크 포함)
    if (!otherCursor || otherCursor.problemId !== problemId || problemId === null) return;
    try {
      decorationIds.current = editorRef.current.deltaDecorations(decorationIds.current, [
        {
          range: new monaco.Range(
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
    labelDom.textContent = studentName || '학생';
    const widget = {
      getId: () => widgetId,
      getDomNode: () => labelDom,
      getPosition: () => ({
        position: {
          lineNumber: otherCursor.lineNumber,
          column: otherCursor.column,
        },
        preference: [monaco.editor.ContentWidgetPositionPreference.ABOVE],
      }),
    };
    editorRef.current.addContentWidget(widget);
    return () => {
      editorRef.current.removeContentWidget(widget);
    };
  }, [otherCursor, studentName, problemId]);

  // 그림판 핸들러
  const handleSetLines = (newLines: Array<{ points: [number, number][]; color: string }>) => {
    onSetSVGLines(newLines);
  };
  const handleClear = () => {
    onClearSVGLines();
  };

  // 네트워크로부터 내려온 code prop 변경 감지용 (diff-match-patch)
  useEffect(() => {
    const editor = editorRef.current;
    console.log('[PATCH] fired, editor?', !!editor, 'code len', code?.length);

    if (!editor) return;
    const model = editor.getModel();
    if (!model) return;

    const oldText = normalizeEOL(model.getValue());
    const newText = normalizeEOL(code);
    if (oldText === newText) return;
    console.log('[PATCH] old===new?', oldText === newText, oldText.length, newText.length);

    // 1) diff 계산
    const dmp = new DiffMatchPatch();
    dmp.Diff_Timeout = 0; // ← 타임아웃 방지
    const diffs = dmp.diff_main(oldText, newText);
    dmp.diff_cleanupEfficiency(diffs);
    console.log('[PATCH] diffs', diffs);

    // === (핵심) 오프셋 기반으로 변환 ===
    let oldIdx = 0;
    const edits: monaco.editor.IIdentifiedSingleEditOperation[] = [];

    for (const [op, text] of diffs as [number, string][]) {
      if (op === DIFF_EQUAL) {
        oldIdx += text.length;
        continue;
      }

      const startPos = model.getPositionAt(oldIdx);

      if (op === DIFF_DELETE) {
        const endPos = model.getPositionAt(oldIdx + text.length);
        edits.push({
          range: new monaco.Range(
            startPos.lineNumber,
            startPos.column,
            endPos.lineNumber,
            endPos.column,
          ),
          text: '',
          forceMoveMarkers: true,
        });
        oldIdx += text.length;
      } else if (op === DIFF_INSERT) {
        // 삭제는 oldIdx 증가했지만, 삽입은 old 텍스트에서는 길이 0
        edits.push({
          range: new monaco.Range(
            startPos.lineNumber,
            startPos.column,
            startPos.lineNumber,
            startPos.column,
          ),
          text,
          forceMoveMarkers: true,
        });
        // oldIdx 그대로
      }
    }
    console.log('✂️ edits count:', edits.length, edits);

    if (edits.length) {
      // 3) 커서·스크롤 보존
      const prevSelections = editor.getSelections();
      const prevScroll = editor.getScrollTop();

      isRemoteUpdating.current = true;
      editor.pushUndoStop();
      editor.executeEdits('remote', edits, prevSelections || []);
      editor.pushUndoStop();
      editor.setScrollTop(prevScroll);
      isRemoteUpdating.current = false;
    }
  }, [code]);

  return (
    <div className="bg-[#1e1e1e] flex flex-col h-full min-w-[600px] min-h-[400px]">
      {/* 에디터 상단 정보 바 */}
      <div className="flex justify-between items-center bg-slate-900 px-4 py-2 text-sm text-slate-400 border-b border-slate-700 min-h-[48px]">
        <span className="font-mono truncate">&lt; &gt; solution.py</span>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1.5 min-w-0">
            <img src={usersIcon} alt="참가자 수" className="w-4 h-4 flex-shrink-0" />
            <span className="truncate max-w-[150px] sm:max-w-[200px] lg:max-w-[250px]">
              {selectedStudentId === null || selectedStudentId === undefined
                ? '내 코드 에디터'
                : `${studentName || selectedStudentId} 에디터`}
            </span>
          </div>
          {/* 그림판 토글 버튼: 분석 패널 상태에 따라 적응형 */}
          <button
            className={`px-2 sm:px-3 py-1 rounded transition text-xs sm:text-sm whitespace-nowrap ${
              showOverlay
                ? 'bg-green-600 text-white'
                : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
            }`}
            onClick={() => setShowOverlay((v) => !v)}
            style={{
              marginRight: isAnalysisPanelOpen ? '380px' : '0px',
              transition: 'margin-right 0.3s ease',
            }}
          >
            {showOverlay ? '그림판 끄기' : '그림판 켜기'}
          </button>
        </div>
      </div>
      {/* Monaco Editor + SvgOverlay */}
      <div className="flex-grow relative min-h-[300px]">
        <Editor
          height="100%"
          language="python"
          theme="vs-dark"
          defaultValue={initialCodeRef.current}
          onChange={(value, _ev) => {
            // 원격 업데이트 중일 땐 무시
            if (!isRemoteUpdating.current) {
              onCodeChange(normalizeEOL(value ?? ''));
            }
          }}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            padding: { top: 16 },
            wordWrap: 'off',
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            folding: true,
            foldingStrategy: 'indentation',
            showFoldingControls: 'always',
            automaticLayout: true,
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
          isAnalysisPanelOpen={isAnalysisPanelOpen}
        />
        {/* 필요하면 오버레이 남겨두기. isConnecting 유지 */}
        {isConnecting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-slate-200 text-sm z-10 pointer-events-none">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mb-3" />
            학생과 연결 중...
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherEditorPanel;
