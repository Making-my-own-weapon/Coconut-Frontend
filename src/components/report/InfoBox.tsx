import React from 'react';

export interface InfoBoxProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const InfoBox: React.FC<InfoBoxProps> = ({ title, icon, children, className = '' }) => {
  return (
    <div className={`bg-slate-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center text-white font-bold mb-3">
        {icon}
        <h3 className="text-md ml-2">{title}</h3>
      </div>
      {children}
    </div>
  );
};

export default InfoBox;
