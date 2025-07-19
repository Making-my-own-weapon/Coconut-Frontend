import React from 'react';
import { Calendar, Users, Clock, ChevronRight } from 'lucide-react';

interface ClassSummaryCardProps {
  title: string;
  date: string;
  participantCount: number;
  successRate: number;
  categories: string[];
  onClick?: () => void;
}

const ClassSummaryCard: React.FC<ClassSummaryCardProps> = ({
  title,
  date,
  participantCount,
  successRate,
  categories,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="w-full bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex justify-between items-center h-full">
        {/* 왼쪽 정보 영역 */}
        <div className="flex flex-col justify-between h-full">
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{date}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{participantCount}명</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>정답률 {successRate}%</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {categories.slice(0, 2).map((category, index) => (
              <span
                key={index}
                className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        {/* 오른쪽 화살표 아이콘 */}
        <div className="flex items-center">
          <ChevronRight className="w-6 h-6 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default ClassSummaryCard;
