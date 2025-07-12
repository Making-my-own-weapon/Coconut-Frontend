import React from 'react';

export interface InfoBoxProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const InfoBox: React.FC<InfoBoxProps> = ({ title, icon, children, className = '' }) => {
  return (
    <div className={`bg-slate-800 rounded-lg p-4 h-[122.5px] flex items-center ${className}`}>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center text-white">
          {icon}
          <h3 className="text-xl ml-2 font-bold">{title}</h3>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
};

export default InfoBox;
