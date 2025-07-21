import React from 'react';
import { CheckCircle, Star, Smile, Frown } from 'lucide-react'; // 👈 1. lucide-react 아이콘 import

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

const MetricCard: React.FC<{ metric: StudentMetric }> = ({ metric }) => {
  const getCardStyles = (type: StudentMetric['type']) => {
    switch (type) {
      case 'accuracy':
        return {
          gradient: 'bg-gradient-to-r from-blue-600 to-blue-500',
          shadow: 'shadow-[0px_8px_30px_0px_rgba(59,130,246,0.20)]',
          icon: <CheckCircle className="w-12 h-12 text-blue-300" />,
          titleSize: 'text-base',
          valueSize: 'text-4xl',
        };
      case 'firstPass':
        return {
          gradient: 'bg-gradient-to-r from-emerald-600 to-emerald-500',
          shadow: 'shadow-[0px_8px_30px_0px_rgba(16,185,129,0.20)]',
          icon: <Star className="w-12 h-12 text-emerald-300" />,
          titleSize: 'text-base',
          valueSize: 'text-4xl',
        };
      case 'bestCategory':
        return {
          gradient: 'bg-gradient-to-r from-amber-600 to-amber-500',
          shadow: 'shadow-[0px_8px_30px_0px_rgba(245,158,11,0.20)]',
          icon: <Smile className="w-12 h-12 text-amber-300" />,
          titleSize: 'text-base',
          valueSize: 'text-3xl',
        };
      case 'worstCategory':
        return {
          gradient: 'bg-gradient-to-r from-violet-600 to-violet-500',
          shadow: 'shadow-[0px_8px_30px_0px_rgba(139,92,246,0.20)]',
          icon: <Frown className="w-12 h-12 text-violet-300" />,
          titleSize: 'text-base',
          valueSize: 'text-3xl',
        };
      default:
        return {
          gradient: 'bg-gradient-to-r from-gray-600 to-gray-500',
          shadow: 'shadow-lg',
          icon: <CheckCircle className="w-12 h-12 text-gray-300" />,
          titleSize: 'text-base',
          valueSize: 'text-4xl',
        };
    }
  };

  const styles = getCardStyles(metric.type);

  return (
    <div className="relative w-full h-[120px] flex-shrink-0">
      {/* Background with gradient and shadow */}
      <div className={`absolute inset-0 rounded-2xl ${styles.gradient} ${styles.shadow}`} />

      {/* Icon */}
      <div className="absolute left-5 top-1/2 -translate-y-1/2 flex-shrink-0">{styles.icon}</div>

      {/* Text content */}
      <div className="absolute left-24 top-1/2 -translate-y-1/2 text-white">
        <div
          className={`${styles.titleSize} font-bold leading-normal`}
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
            className="text-sm font-medium leading-normal"
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
  metrics, // 👈 2. 기본값 설정을 제거합니다.
  className = '',
}) => {
  // 3. metrics prop이 없을 경우(undefined) 빈 배열을 사용하도록 합니다.
  const displayMetrics = metrics || [];

  return (
    <div className={`flex flex-wrap gap-4 ... ${className}`}>
      {displayMetrics.map((metric, index) => (
        <div key={`${metric.type}-${index}`} className="flex-1 ...">
          <MetricCard metric={metric} />
        </div>
      ))}
    </div>
  );
};

export default BoxReportStudent;
