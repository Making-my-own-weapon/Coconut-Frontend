import React from 'react';
import ClassSummaryCard from './ClassSummaryCard';

// 이 컴포넌트가 받을 데이터의 타입
interface ClassData {
  title: string;
  date: string;
  participantCount: number;
  successRate: number;
  categories: string[];
}

interface CreatedClassesViewProps {
  classes: ClassData[];
}

const CreatedClassesView: React.FC<CreatedClassesViewProps> = ({ classes }) => {
  return (
    <div className="space-y-4">
      {classes.map((classInfo, index) => (
        <ClassSummaryCard key={index} {...classInfo} />
      ))}
    </div>
  );
};
export default CreatedClassesView;
