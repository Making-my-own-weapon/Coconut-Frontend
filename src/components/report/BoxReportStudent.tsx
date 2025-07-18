import React from 'react';

export interface StudentMetric {
  type: 'accuracy' | 'firstPass' | 'bestCategory' | 'worstCategory';
  title: string;
  value: string;
  subtitle?: string;
}

export interface BoxReportStudentProps {
  metrics?: StudentMetric[];
  className?: string;
}

const defaultMetrics: StudentMetric[] = [
  {
    type: 'accuracy',
    title: '정답률',
    value: '100%',
  },
  {
    type: 'firstPass',
    title: '첫 제출에 통과한 문제',
    value: '7 개',
  },
  {
    type: 'bestCategory',
    title: '가장 많이 통과한 카테고리',
    value: '수학',
  },
  {
    type: 'worstCategory',
    title: '가장 못 푼 카테고리',
    value: '너비 우선 탐색',
  },
];

const CheckCircleIcon: React.FC = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M24 32L29.3333 37.3333L40 26.6667M56 32C56 35.1517 55.3792 38.2726 54.1731 41.1844C52.967 44.0962 51.1992 46.742 48.9706 48.9706C46.742 51.1992 44.0962 52.967 41.1844 54.1731C38.2726 55.3792 35.1517 56 32 56C28.8483 56 25.7274 55.3792 22.8156 54.1731C19.9038 52.967 17.258 51.1992 15.0294 48.9706C12.8008 46.742 11.033 44.0962 9.82689 41.1844C8.62078 38.2726 8 35.1517 8 32C8 25.6348 10.5286 19.5303 15.0294 15.0294C19.5303 10.5286 25.6348 8 32 8C38.3652 8 44.4697 10.5286 48.9706 15.0294C53.4714 19.5303 56 25.6348 56 32Z"
      stroke="#A7C9FF"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HourglassIcon: React.FC = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M13.334 58.6666H50.6673M13.334 5.33325H50.6673M45.334 58.6666V47.5412C45.3337 46.1269 44.7716 44.7705 43.7713 43.7706L32.0007 31.9999M32.0007 31.9999L20.23 43.7706C19.2297 44.7705 18.6676 46.1269 18.6673 47.5412V58.6666M32.0007 31.9999L20.23 20.2293C19.2297 19.2293 18.6676 17.873 18.6673 16.4586V5.33325M32.0007 31.9999L43.7713 20.2293C44.7716 19.2293 45.3337 17.873 45.334 16.4586V5.33325"
      stroke="#D3D5D5"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SmileIcon: React.FC = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M24.8 24.8H24.824M39.2 24.8H39.224M56 32C56 45.2548 45.2548 56 32 56C18.7452 56 8 45.2548 8 32C8 18.7452 18.7452 8 32 8C45.2548 8 56 18.7452 56 32ZM46.4 34.4C45.8274 37.7898 44.0609 40.8629 41.4198 43.0638C38.7788 45.2646 35.4375 46.448 32 46.4C28.5625 46.448 25.2212 45.2646 22.5802 43.0638C19.9391 40.8629 18.1726 37.7898 17.6 34.4H46.4Z"
      stroke="#C7AFFF"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FrownIcon: React.FC = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M41.6 41.6C41.6 41.6 38 36.8 32 36.8C26 36.8 22.4 41.6 22.4 41.6M24.8 24.8H24.824M39.2 24.8H39.224M56 32C56 45.2548 45.2548 56 32 56C18.7452 56 8 45.2548 8 32C8 18.7452 18.7452 8 32 8C45.2548 8 56 18.7452 56 32Z"
      stroke="#F3DEBB"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const MetricCard: React.FC<{ metric: StudentMetric }> = ({ metric }) => {
  const getCardStyles = (type: StudentMetric['type']) => {
    switch (type) {
      case 'accuracy':
        return {
          gradient: 'bg-gradient-to-r from-blue-600 to-blue-500',
          shadow: 'shadow-[0px_8px_30px_0px_rgba(59,130,246,0.20)]',
          icon: <CheckCircleIcon />,
          titleSize: 'text-base',
          valueSize: 'text-4xl',
        };
      case 'firstPass':
        return {
          gradient: 'bg-gradient-to-r from-emerald-600 to-emerald-500',
          shadow: 'shadow-[0px_8px_30px_0px_rgba(16,185,129,0.20)]',
          icon: <HourglassIcon />,
          titleSize: 'text-base',
          valueSize: 'text-4xl',
        };
      case 'bestCategory':
        return {
          gradient: 'bg-gradient-to-r from-violet-600 to-violet-500',
          shadow: 'shadow-[0px_8px_30px_0px_rgba(139,92,246,0.20)]',
          icon: <SmileIcon />,
          titleSize: 'text-base',
          valueSize: 'text-3xl',
        };
      case 'worstCategory':
        return {
          gradient: 'bg-gradient-to-r from-amber-600 to-amber-500',
          shadow: 'shadow-[0px_8px_30px_0px_rgba(245,158,11,0.20)]',
          icon: <FrownIcon />,
          titleSize: 'text-base',
          valueSize: 'text-3xl',
        };
      default:
        return {
          gradient: 'bg-gradient-to-r from-gray-600 to-gray-500',
          shadow: 'shadow-lg',
          icon: <CheckCircleIcon />,
          titleSize: 'text-base',
          valueSize: 'text-4xl',
        };
    }
  };

  const styles = getCardStyles(metric.type);

  return (
    <div className="relative w-full max-w-[330px] h-[120px] flex-shrink-0">
      {/* Background with gradient and shadow */}
      <div className={`absolute inset-0 rounded-2xl ${styles.gradient} ${styles.shadow}`} />

      {/* Icon */}
      <div className="absolute left-4 top-7 flex-shrink-0">{styles.icon}</div>

      {/* Text content */}
      <div className="absolute left-20 top-4 text-white">
        <div
          className={`${styles.titleSize} font-bold leading-normal mb-1`}
          style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif' }}
        >
          {metric.title}
        </div>
        <div
          className={`${styles.valueSize} font-bold leading-tight`}
          style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif' }}
        >
          {metric.value}
        </div>
        {metric.subtitle && (
          <div
            className="text-sm font-medium leading-normal mt-1"
            style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif' }}
          >
            {metric.subtitle}
          </div>
        )}
      </div>
    </div>
  );
};

const BoxReportStudent: React.FC<BoxReportStudentProps> = ({
  metrics = defaultMetrics,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full ${className}`}>
      {metrics.map((metric, index) => (
        <MetricCard key={`${metric.type}-${index}`} metric={metric} />
      ))}
    </div>
  );
};

export default BoxReportStudent;
