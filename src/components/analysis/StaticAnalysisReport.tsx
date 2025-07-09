import React from 'react';
import { useStaticAnalysis } from '../../analysis/useStaticAnalysis';
import type { AnalysisResult } from '../../analysis/staticAnalysis';

interface StaticAnalysisReportProps {
  code: string;
}

const StaticAnalysisReport: React.FC<StaticAnalysisReportProps> = ({ code }) => {
  const { result, loading } = useStaticAnalysis(code);

  return (
    <div className="p-4 text-slate-200">
      <h3 className="font-bold mb-2">정적 분석 결과</h3>
      {loading ? (
        <div className="text-slate-400">분석 중...</div>
      ) : result ? (
        <div>
          {result.functions && result.functions.length > 0 && (
            <div className="mb-4">
              {result.functions.map((fn: AnalysisResult['functions'][number], idx: number) => (
                <div key={fn.name + idx} className="mb-3 p-2 bg-slate-800 rounded">
                  <div className="font-bold">[함수: {fn.name}]</div>
                  <div>시간복잡도: {fn.time}</div>
                  <div>공간복잡도: {fn.space}</div>
                  <div>오류: {fn.errors && fn.errors.length ? fn.errors.join('\n') : '없음'}</div>
                </div>
              ))}
            </div>
          )}
          <div className="p-2 bg-slate-800 rounded">
            <div className="font-bold">[글로벌 코드]</div>
            <div>시간복잡도: {result.global?.time}</div>
            <div>공간복잡도: {result.global?.space}</div>
            <div>
              오류:{' '}
              {result.global?.errors && result.global.errors.length
                ? result.global.errors.join('\n')
                : '없음'}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-slate-400">문제가 발견되지 않았습니다.</div>
      )}
    </div>
  );
};

export default StaticAnalysisReport;
