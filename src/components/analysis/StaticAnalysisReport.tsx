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

  if (loading) return <div className="p-4 text-slate-400">실시간 분석 중...</div>;
  if (!result)
    return <div className="p-4 text-slate-400">코드를 입력하면 실시간으로 분석됩니다.</div>;

  const { functions, global, overall } = result;
  const mainResult = functions.length > 0 ? functions[0] : global;
  const syntaxErrors = global.errors;

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
              <div className="font-bold text-white text-sm">{overall.worstTimeComplexity}</div>
            </div>
            <div className="flex flex-col items-center flex-1">
              <div className="text-slate-400 text-sm">공간 복잡도</div>
              <div className="font-bold text-white text-sm">{overall.worstSpaceComplexity}</div>
            </div>
          </div>
          <div className="w-full pt-3 border-t border-slate-600 mt-3">
            <h4 className="text-sm font-semibold text-slate-300 mb-2">문법 오류:</h4>
            {syntaxErrors && syntaxErrors.length > 0 ? (
              syntaxErrors.map((err: string, i: number) => (
                <p key={i} className="text-red-400 text-xs font-mono break-words">
                  - {err}
                </p>
              ))
            ) : (
              <p className="text-green-400 text-sm">문법 오류 없음</p>
            )}
          </div>
        </div>
      </div>

      {/* 실시간 힌트 카드 */}
      <div className="flex flex-col items-center gap-3 pt-6 pb-6 px-1 relative self-stretch w-full bg-slate-700 rounded-lg border border-solid border-slate-600 shadow-sm">
        <div className="flex w-full items-center relative px-4">
          <img className="w-4 h-4 mr-2" alt="Hint" src={lightbulbIcon} />
          <h3 className="text-white font-bold">실시간 힌트</h3>
        </div>
        <div className="flex flex-col items-start gap-3 pt-4 pb-2 px-6 relative self-stretch w-full border-t border-slate-600">
          {mainResult.suggestions && mainResult.suggestions.length > 0 ? (
            mainResult.suggestions.map((suggestion: string, i: number) => (
              <div
                key={i}
                className="flex items-start p-3 relative self-stretch w-full bg-yellow-900/20 rounded-lg border border-solid border-yellow-700"
              >
                <img
                  className="w-4 h-4 mr-2 mt-1 shrink-0"
                  alt="Warning"
                  src={exclamationTriangleIcon}
                />
                <p className="flex-1 text-yellow-400 text-sm">{suggestion}</p>
              </div>
            ))
          ) : (
            <div className="flex items-start p-3 relative self-stretch w-full bg-green-900/20 rounded-lg border border-solid border-green-700">
              <img
                className="w-4 h-4 mr-2 mt-1 shrink-0"
                alt="Success"
                src={checkCircleGreenIcon}
              />
              <p className="flex-1 text-green-400 text-sm">코드 품질이 양호합니다</p>
            </div>
          )}
        </div>
      </div>

      {/* 개선 제안 카드 */}
      <div className="flex flex-col items-start gap-3 p-6 relative self-stretch w-full bg-slate-700 rounded-lg border border-solid border-slate-600 shadow-sm">
        <div className="flex items-center relative self-stretch w-full">
          <img className="w-4 h-4 mr-2" alt="Suggestion" src={checkCircleGreenIcon} />
          <h3 className="text-white font-bold">개선 제안</h3>
        </div>
        <div className="flex flex-col items-start gap-2 relative self-stretch w-full pt-4 border-t border-slate-600">
          {overall.codeQuality === 'poor' && (
            <p className="text-red-400 text-sm">
              · 현재 시간 복잡도: {overall.worstTimeComplexity} - 알고리즘 최적화가 필요합니다
            </p>
          )}
          {overall.codeQuality === 'fair' && (
            <p className="text-yellow-400 text-sm">
              · 현재 시간 복잡도: {overall.worstTimeComplexity} - 더 효율적인 알고리즘을
              고려해보세요
            </p>
          )}
          {overall.codeQuality === 'good' && (
            <p className="text-blue-400 text-sm">
              · 현재 시간 복잡도: {overall.worstTimeComplexity} - 양호한 성능입니다
            </p>
          )}
          {overall.codeQuality === 'excellent' && (
            <p className="text-green-400 text-sm">
              · 현재 시간 복잡도: {overall.worstTimeComplexity} - 우수한 성능입니다
            </p>
          )}
          {overall.totalFunctions > 1 && (
            <p className="text-slate-300 text-sm">
              · 총 {overall.totalFunctions}개의 함수가 분석되었습니다
            </p>
          )}
        </div>
      </div>

      {/* 함수별 상세 분석 */}
      {(functions.length > 1 || (functions.length === 0 && global)) && (
        <div className="flex flex-col items-start gap-3 p-6 relative self-stretch w-full bg-slate-700 rounded-lg border border-solid border-slate-600 shadow-sm">
          <div className="flex items-center relative self-stretch w-full">
            <img className="w-4 h-4 mr-2" alt="Functions" src={chartBarIcon} />
            <h3 className="text-white font-bold">함수/전역 코드별 분석</h3>
          </div>
          <div className="flex flex-col items-start gap-3 relative self-stretch w-full pt-4 border-t border-slate-600">
            {/* 전역 코드 먼저 표시 */}
            {global && (
              <div className="w-full p-3 bg-slate-800 rounded-lg border border-slate-600">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-semibold text-sm">전역 코드</h4>
                </div>
                <div className="flex gap-4 text-xs">
                  <span className="text-slate-300">시간: {global.timeComplexity}</span>
                  <span className="text-slate-300">공간: {global.spaceComplexity}</span>
                </div>
              </div>
            )}
            {/* 함수별 분석 */}
            {functions.map((func, index) => (
              <div
                key={index}
                className="w-full p-3 bg-slate-800 rounded-lg border border-slate-600"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white font-semibold text-sm">{func.name}</h4>
                  <span className="text-slate-400 text-xs">라인 {func.lineNumber}</span>
                </div>
                <div className="flex gap-4 text-xs">
                  <span className="text-slate-300">시간: {func.timeComplexity}</span>
                  <span className="text-slate-300">공간: {func.spaceComplexity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaticAnalysisReport;
