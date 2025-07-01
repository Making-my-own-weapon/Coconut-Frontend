//src/components/join/ActionCard.tsx
import React from 'react';

// 이 카드가 어떤 props를 받을지 명확하게 정의합니다.
interface ActionCardProps {
  icon: React.ReactNode;
  iconBgColor: string;
  title: string;
  description: string;
  buttonIcon: React.ReactNode;
  buttonText: string;
  buttonColor: string;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
}

const ActionCard: React.FC<ActionCardProps> = ({
  icon,
  iconBgColor,
  title,
  description,
  buttonIcon,
  buttonText,
  buttonColor,
  onSubmit,
  children,
}) => (
  <form
    onSubmit={onSubmit}
    className="bg-white p-4 rounded-lg border shadow-sm flex flex-col h-full"
  >
    <div className="flex items-start gap-1">
      <div
        className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBgColor}`}
      >
        {icon}
      </div>
      <div className="flex-grow">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="mt-2 text-gray-600 text-sm min-h-[72px]">{description}</p>
      </div>
    </div>
    {/* 이 카드의 내용물(form 등)이 이 자리에 렌더링됩니다. */}
    <div className="mt-1 flex-grow">{children}</div>
    <button
      type="submit"
      disabled={buttonColor.includes('gray')}
      className={`w-full mt-6 py-2 rounded-lg text-white font-bold flex items-center justify-center gap-2 transition-colors ${buttonColor}`}
    >
      {buttonIcon}
      {buttonText}
    </button>
  </form>
);

export default ActionCard;
