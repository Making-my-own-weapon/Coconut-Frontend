import React from 'react';

export interface MetricCardProps {
  title: string;
  value?: string;
  subtitle?: string;
  additionalInfo?: string;
  bgGradient: string;
  shadowColor: string;
  icon: React.ReactNode;
  iconBg?: string;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  additionalInfo,
  bgGradient,
  shadowColor,
  icon,
  // iconBg = 'bg-white',
  className = '',
}) => {
  return (
    // 1. 카드의 가장 바깥 div를 flex 컨테이너로 만들고, 아이템들을 세로 중앙 정렬(items-center)합니다.
    <div
      className={`p-4 rounded-lg flex items-center h-28 gap-4 ${bgGradient} ${shadowColor} ${className}`}
    >
      {/* 2. 아이콘을 표시하는 부분입니다. */}
      <div className="flex-shrink-0">{icon}</div>

      {/* 3. 모든 텍스트를 flex-col 컨테이너로 묶어 세로로 정렬합니다. */}
      <div className="flex flex-col">
        <span className="text-sm text-white/80">{title}</span>
        {value && <span className="text-2xl font-bold text-white">{value}</span>}
        {subtitle && <span className="text-lg font-semibold text-white">{subtitle}</span>}
        {additionalInfo && <span className="text-xs text-white/70">{additionalInfo}</span>}
      </div>
    </div>
  );
};

export default MetricCard;
