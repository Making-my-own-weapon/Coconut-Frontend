import React from 'react';
import Editor from '@monaco-editor/react';
import usersIcon from '../../../assets/usersIcon.svg';
import SvgOverlay from '../../common/SvgOverlay';
import { useRef, useState, useEffect } from 'react';

interface SVGLine {
  points: [number, number][];
  color: string;
}

interface TeacherEditorPanelProps {
  code: string;
  onCodeChange: (value: string | undefined) => void;
  selectedStudentId?: number | null; // 추가: 현재 선택된 학생 id
  studentName?: string; // 추가: 학생 이름
  onClickReturnToTeacher?: () => void; // 추가: 내 코드로 전환 버튼 클릭 핸들러
  isConnecting?: boolean; // 추가: 학생 연결 중 상태
  roomId?: string; // 추가: 방 ID
  userId?: string; // 추가: 사용자 ID
  role?: 'teacher' | 'student'; // 추가: 사용자 역할
  svgLines: SVGLine[]; // SVG 라인 데이터
  onAddSVGLine: (line: SVGLine) => void; // SVG 라인 추가 핸들러
  onClearSVGLines: () => void; // SVG 라인 클리어 핸들러
  onSetSVGLines: (lines: SVGLine[]) => void; // SVG 라인 설정 핸들러
}

const TeacherEditorPanel: React.FC<TeacherEditorPanelProps> = ({
  code,
  onCodeChange,
  selectedStudentId,
  studentName,
  onClickReturnToTeacher,
  isConnecting = false,
  roomId,
  userId,
  role,
  svgLines,
  onAddSVGLine,
  onClearSVGLines,
  onSetSVGLines,
}) => {
  const editorRef = useRef<any>(null);
  const [color, setColor] = useState('#ff0000');
  // 그림판 on/off 상태
  const [showOverlay, setShowOverlay] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);

  // Monaco Editor 스크롤 동기화
  const handleEditorMount = (editor: any) => {
    editorRef.current = editor;
    setScrollTop(editor.getScrollTop());
    editor.onDidScrollChange(() => {
      setScrollTop(editor.getScrollTop());
    });
  };

  // SVGOverlay에서 사용할 핸들러들
  const handleSetLines = (newLines: Array<{ points: [number, number][]; color: string }>) => {
    onSetSVGLines(newLines);
  };

  const handleClear = () => {
    onClearSVGLines();
  };

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
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 16 },
              }}
              onMount={handleEditorMount}
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
