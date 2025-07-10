import React from 'react';

export interface MetricCardProps {
  title: string;
  value: string;
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
  iconBg = 'bg-white',
  className = '',
}) => {
  return (
    <div className={`w-72 h-[120px] flex-shrink-0 relative ${className}`}>
      <div
        className={`w-full h-full flex-shrink-0 rounded-2xl ${bgGradient} ${shadowColor} absolute left-0 top-0`}
      ></div>

      {/* Icon container */}
      <div
        className={`w-[60px] h-[60px] xl:w-12 xl:h-12 flex-shrink-0 rounded-xl ${iconBg} absolute left-[23px] top-[35px] xl:left-4 xl:top-6 flex items-center justify-center`}
      >
        {icon}
      </div>

      {/* Main value */}
      <div className="text-white font-inter text-[32px] xl:text-2xl font-bold leading-12 absolute left-[92px] top-[29px] xl:left-20 xl:top-6">
        {value}
      </div>

      {/* Title */}
      <div className="text-white font-inter text-base xl:text-sm font-semibold leading-6 absolute left-[92px] top-[71px] xl:left-20 xl:bottom-2">
        {title}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div className="text-white font-inter text-sm xl:text-xs font-bold leading-[10px] absolute left-[92px] top-[52px] xl:left-20 xl:top-10">
          {subtitle}
        </div>
      )}

      {/* Additional info */}
      {additionalInfo && (
        <div className="text-white font-inter text-xs xl:text-[10px] font-normal leading-[10px] absolute left-[92px] top-[74px] xl:left-20 xl:top-14">
          {additionalInfo}
        </div>
      )}
    </div>
  );
};

export default MetricCard;
