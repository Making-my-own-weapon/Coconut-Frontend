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
}) => {
  const [drawing, setDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState<{
    points: [number, number][];
    color: string;
  } | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  if (!show) return null;

  // 마우스 이벤트 핸들러
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
      {/* 색상 선택 & 지우기 버튼: readOnly가 아니고 show일 때만 (우상단) */}
      {!readOnly && setColor && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            display: 'flex',
            gap: 8,
            pointerEvents: 'auto',
            zIndex: 20,
          }}
        >
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{
                background: c,
                width: 24,
                height: 24,
                border: color === c ? '2px solid #fff' : '1px solid #ccc',
              }}
            />
          ))}
          <button onClick={handleClear} style={{ padding: '0 8px', height: 24 }}>
            지우기
          </button>
        </div>
      )}
    </>
  );
};

export default SvgOverlay;
