import React from 'react';

interface ActionBoxProps {
  type: 'warning' | 'danger';
  title: string;
  description: string;
}

const ActionBox: React.FC<ActionBoxProps> = ({ type, title, description }) => {
  const styles = {
    warning: {
      background: '#FEF3C7',
      border: '#F59E0B',
      titleColor: '#92400E',
      descColor: '#B45309',
    },
    danger: {
      background: '#FEE2E2',
      border: '#EF4444',
      titleColor: '#DC2626',
      descColor: '#B91C1C',
    },
  };

  const currentStyle = styles[type];

  return (
    <div className="w-full sm:w-[371px] h-[106px] relative">
      <div
        className="w-full h-full rounded-lg border"
        style={{
          backgroundColor: currentStyle.background,
          borderColor: currentStyle.border,
        }}
      >
        <div className="p-6">
          <h3
            className="text-lg font-medium leading-7 mb-2"
            style={{ color: currentStyle.titleColor }}
          >
            {title}
          </h3>
          <p className="text-sm leading-5" style={{ color: currentStyle.descColor }}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ActionBox;
