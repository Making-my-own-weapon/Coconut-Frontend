import React from 'react';
import { useStaticAnalysis } from '../../analysis/useStaticAnalysis';
// 존재하지 않는 아이콘들을, 실제로 있는 아이콘으로 대체합니다.
import chartBarIcon from '../../assets/chart-bar.svg';
import lightbulbIcon from '../../assets/lightbulb.svg';
import checkCircleGreenIcon from '../../assets/check-circle-green.svg';
import exclamationTriangleIcon from '../../assets/exclamation-triangle.svg';

interface StaticAnalysisReportProps {
  code: string;
}

const StaticAnalysisReport: React.FC<StaticAnalysisReportProps> = ({ code }) => {
  const { result, loading } = useStaticAnalysis(code);

  if (loading) return <div className="p-4 text-slate-400">분석 중...</div>;
  if (!result) return <div className="p-4 text-slate-400">아직 분석된 내용이 없습니다.</div>;

  const { functions, global } = result;
  const mainResult = functions.length > 0 ? functions[0] : global;
  const pyflakesErrors = functions.length > 0 ? mainResult.errors : global.errors;

  return (
    <div className="flex flex-col items-start gap-3 self-stretch w-full">
      {/* 코드 품질 지표 카드 */}
      <div className="flex flex-col items-center gap-3 pt-6 pb-6 px-1 relative self-stretch w-full bg-slate-700 rounded-lg border border-solid border-slate-600 shadow-sm">
        <div className="flex w-full items-center relative px-4">
          <img className="w-4 h-4 mr-2" alt="Frame" src={chartBarIcon} />
          <h3 className="text-white font-bold">코드 품질 지표</h3>
        </div>
        <div className="flex flex-col items-start gap-3 pt-4 pb-2 px-6 relative self-stretch w-full border-t border-slate-600">
          <div className="flex items-start justify-around gap-3 relative self-stretch w-full">
            <div className="flex flex-col items-center flex-1">
              <div className="text-slate-400 text-sm">시간 복잡도</div>
              <div className="font-bold text-white text-sm">{mainResult.time}</div>
            </div>
            <div className="flex flex-col items-center flex-1">
              <div className="text-slate-400 text-sm">공간 복잡도</div>
              <div className="font-bold text-white text-sm">{mainResult.space}</div>
            </div>
          </div>
          <div className="w-full pt-3 border-t border-slate-600 mt-3">
            <h4 className="text-sm font-semibold text-slate-300 mb-2">잠재적 오류:</h4>
            {pyflakesErrors && pyflakesErrors.length > 0 ? (
              pyflakesErrors.map((err, i) => (
                <p key={i} className="text-yellow-400 text-xs font-mono break-words">
                  - {err}
                </p>
              ))
            ) : (
              <p className="text-slate-500 text-sm">발견된 오류 없음</p>
            )}
          </div>
        </div>
      </div>

      {/* 실시간 힌트 카드 (목업) */}
      <div className="flex flex-col items-center gap-3 pt-6 pb-6 px-1 relative self-stretch w-full bg-slate-700 rounded-lg border border-solid border-slate-600 shadow-sm">
        <div className="flex w-full items-center relative px-4">
          <img className="w-4 h-4 mr-2" alt="Hint" src={lightbulbIcon} />
          <h3 className="text-white font-bold">실시간 힌트</h3>
        </div>
        <div className="flex flex-col items-start gap-3 pt-4 pb-2 px-6 relative self-stretch w-full border-t border-slate-600">
          <div className="flex items-start p-3 relative self-stretch w-full bg-yellow-900/20 rounded-lg border border-solid border-yellow-700">
            <img
              className="w-4 h-4 mr-2 mt-1 shrink-0"
              alt="Warning"
              src={exclamationTriangleIcon}
            />
            <p className="flex-1 text-yellow-400 text-sm">
              중첩 루프로 인한 성능 이슈가 감지되었습니다
            </p>
          </div>
        </div>
      </div>

      {/* 개선 제안 카드 (목업) */}
      <div className="flex flex-col items-start gap-3 p-6 relative self-stretch w-full bg-slate-700 rounded-lg border border-solid border-slate-600 shadow-sm">
        <div className="flex items-center relative self-stretch w-full">
          <img className="w-4 h-4 mr-2" alt="Suggestion" src={checkCircleGreenIcon} />
          <h3 className="text-white font-bold">개선 제안</h3>
        </div>
        <div className="flex flex-col items-start gap-2 relative self-stretch w-full pt-4 border-t border-slate-600">
          <p className="text-slate-300 text-sm">
            · HashMap을 사용하면 O(n) 시간 복잡도로 개선 가능
          </p>
        </div>
      </div>
    </div>
  );
};

export default StaticAnalysisReport;
