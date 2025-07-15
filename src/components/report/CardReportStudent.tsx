import React from 'react';

export interface CardReportStudentProps {
  studentName: string;
  correctAnswers: number;
  className?: string;
}

const CardReportStudent: React.FC<CardReportStudentProps> = ({
  studentName,
  correctAnswers,
  className = '',
}) => {
  return (
    <div className={`relative w-[330px] h-[556px] mb-[50px] mt-[50px] ${className}`}>
      {/* Background card with exact styling */}
      <div
        className="absolute inset-0 bg-slate-800 border border-slate-600 rounded-2xl"
        style={{
          boxShadow: '0px 8px 30px 0px rgba(0, 0, 0, 0.30)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Profile circle */}
      <div className="absolute left-[71px] top-[117px]">
        <svg
          width="178"
          height="178"
          viewBox="0 0 178 178"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[178px] h-[178px]"
        >
          <circle cx="89" cy="89" r="89" fill="#D9D9D9" />
        </svg>
      </div>

      {/* Student name */}
      <div
        className="absolute left-[109px] top-[331px] w-[100px] h-[40px] text-white text-4xl font-extrabold leading-10"
        style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif' }}
      >
        {studentName}
      </div>

      {/* "정답:" label */}
      <div
        className="absolute left-[104px] top-[407px] w-[77px] h-[40px] text-white text-4xl font-normal leading-10"
        style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif' }}
      >
        정답:
      </div>

      {/* Correct answers number */}
      <div
        className="absolute left-[191px] top-[406px] w-[24px] h-[40px] text-white text-4xl font-normal leading-10"
        style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif' }}
      >
        {correctAnswers}
      </div>
    </div>
  );
};

export default CardReportStudent;
