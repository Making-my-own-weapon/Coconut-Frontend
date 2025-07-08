import React from 'react';

export interface InfoBoxProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const InfoBox: React.FC<InfoBoxProps> = ({ title, icon, children, className = '' }) => {
  return (
    <div className={`w-[611px] h-[120px] flex-shrink-0 relative ${className}`}>
      <div className="w-[611px] h-[120px] flex-shrink-0 rounded-2xl border border-slate-600 bg-slate-800 shadow-[0px_8px_30px_0px_rgba(0,0,0,0.30)] backdrop-blur-[1px] absolute left-0 top-0"></div>

      {/* Icon */}
      <div className="w-6 h-6 flex-shrink-0 absolute left-6 top-12">{icon}</div>

      {/* Title */}
      <div className="text-white font-inter text-xl font-bold leading-[30px] absolute left-[66px] top-[45px]">
        {title}
      </div>

      {/* Content */}
      <div className="absolute right-6 top-[45px]">{children}</div>
    </div>
  );
};

export default InfoBox;
