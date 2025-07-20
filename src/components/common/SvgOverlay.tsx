import React, { useRef, useState } from 'react';

export const COLORS = ['#ff0000', '#00ff00', '#0000ff', '#000000', '#ffffff'];

interface SVGOverlayProps {
  lines: Array<{ points: [number, number][]; color: string }>;
  setLines: (lines: Array<{ points: [number, number][]; color: string }>) => void;
  addLine?: (line: { points: [number, number][]; color: string }) => void;
  color?: string;
  setColor?: React.Dispatch<React.SetStateAction<string>>;
  readOnly?: boolean;
  show: boolean;
  onClear?: () => void;
  scrollTop?: number;
  editorRef?: React.RefObject<any>;
  isAnalysisPanelOpen?: boolean; // 분석 패널 열림 상태 추가
}

const SvgOverlay: React.FC<SVGOverlayProps> = ({
  lines,
  setLines,
  addLine,
  color = COLORS[0],
  setColor = () => {},
  readOnly = false,
  show,
  onClear,
  scrollTop = 0,
  editorRef,
  isAnalysisPanelOpen = false, // 분석 패널 열림 상태 추가
}) => {
  const [drawing, setDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState<{
    points: [number, number][];
    color: string;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  if (!show) return null;

  // 드래그 시작
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (readOnly) return;
    setDrawing(true);
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top + scrollTop;
    setCurrentLine({ points: [[x, y]], color });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (readOnly) return;
    if (!drawing || !currentLine) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top + scrollTop;
    setCurrentLine({
      ...currentLine,
      points: [...currentLine.points, [x, y]],
    });
  };

  const handleMouseUp = () => {
    if (readOnly) return;
    if (drawing && currentLine) {
      if (addLine) {
        addLine(currentLine);
      } else {
        setLines([...lines, currentLine]);
      }
      setTimeout(() => setCurrentLine(null), 0);
    }
    setDrawing(false);
  };

  const handleClear = () => {
    setLines([]);
    setCurrentLine(null);
    if (onClear) onClear();
  };

  // 드로잉 중일 때만 pointerEvents: 'auto', 그 외에는 'none'
  const svgPointerEvents = readOnly ? 'none' : 'auto';

  // 휠 이벤트를 Monaco Editor에 강제로 전달
  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    if (editorRef?.current) {
      const curr = editorRef.current.getScrollTop();
      editorRef.current.setScrollTop(curr + e.deltaY);
      e.preventDefault();
    }
  };

  return (
    <>
      <svg
        ref={svgRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: svgPointerEvents,
          zIndex: 10,
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <g transform={`translate(0, -${scrollTop})`}>
          {[...lines, currentLine].map((line, idx) =>
            line ? (
              <polyline
                key={idx}
                points={line.points.map(([x, y]) => `${x},${y}`).join(' ')}
                fill="none"
                stroke={line.color}
                strokeWidth={3}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ) : null,
          )}
        </g>
      </svg>

      {/* 색상 선택 & 지우기 버튼: readOnly가 아니고 show일 때만 (오른쪽 고정 위치) */}
      {!readOnly && setColor && (
        <div
          style={{
            position: 'absolute',
            top: 16, // 에디터 헤더 바로 아래
            right: 16, // 오른쪽에 붙임
            display: 'flex',
            gap: 8,
            pointerEvents: 'auto',
            zIndex: 9999,
            backgroundColor: 'rgba(30, 30, 30, 0.9)',
            padding: '8px',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            userSelect: 'none',
            transition: 'transform 0.3s ease',
            transform: isAnalysisPanelOpen ? 'translateX(-380px)' : 'translateX(0)',
          }}
        >
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={(e) => {
                e.stopPropagation();
                setColor(c);
              }}
              style={{
                background: c,
                width: 24,
                height: 24,
                border: color === c ? '2px solid #fff' : '1px solid #ccc',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            />
          ))}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            style={{
              padding: '0 8px',
              height: 24,
              backgroundColor: '#374151',
              color: '#ffffff',
              border: '1px solid #4b5563',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#4b5563';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#374151';
            }}
          >
            지우기
          </button>
        </div>
      )}
    </>
  );
};

export default SvgOverlay;
