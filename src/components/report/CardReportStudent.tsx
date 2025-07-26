import React from 'react';
import Lottie from 'lottie-react'; // 👈 Lottie 라이브러리 import
import animationData from '../../assets/animations/study.json';
import { motion } from 'framer-motion';

export interface CardReportStudentProps {
  studentName: string;
  correctAnswers: number;
  totalProblems: number;
  className?: string;
}

const CardReportStudent: React.FC<CardReportStudentProps> = ({
  studentName,
  correctAnswers,
  totalProblems,
  className = '',
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }} // 마우스를 올리면 1.05배 커지고 위로 5px 이동
      className={`relative w-[330px] h-[556px] ${className}`}
    >
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
        <Lottie animationData={animationData} loop={true} className="w-[178px] h-[178px]" />
      </div>

      {/* Student name */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-[331px] w-[100px] h-[40px] text-white text-4xl font-extrabold leading-10"
        style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif' }}
      >
        {studentName}
      </div>

      {/* "정답:" label */}
      <div
        className="absolute left-[90px] top-[407px] w-[77px] h-[40px] text-white text-4xl font-normal leading-10"
        style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif' }}
      >
        정답:
      </div>

      {/* Correct answers number */}
      <div
        className="absolute left-[180px] top-[406px] w-[60px] h-[40px] text-white text-4xl font-normal leading-10"
        style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif' }}
      >
        {correctAnswers}/{totalProblems}
      </div>
    </motion.div>
  );
};

export default CardReportStudent;
