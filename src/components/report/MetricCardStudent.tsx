import React from 'react';

export interface MetricCardStudentProps {
  label?: string;
  percentage?: string;
  className?: string;
}

const MetricCardStudent: React.FC<MetricCardStudentProps> = ({
  label = '정답률',
  percentage = '100%',
  className = '',
}) => {
  return (
    <div className={`relative w-full max-w-[330px] h-[120px] flex-shrink-0 ${className}`}>
      {/* Background with gradient and shadow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-700 to-blue-500 shadow-[0px_8px_30px_0px_rgba(59,130,246,0.20)]" />

      {/* Checkmark Icon */}
      <div className="absolute left-[15px] top-[28px]">
        <svg
          width="64"
          height="64"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-16 h-16 flex-shrink-0"
        >
          <path
            d="M24 32L29.3333 37.3333L40 26.6667M56 32C56 35.1517 55.3792 38.2726 54.1731 41.1844C52.967 44.0962 51.1992 46.742 48.9706 48.9706C46.742 51.1992 44.0962 52.967 41.1844 54.1731C38.2726 55.3792 35.1517 56 32 56C28.8483 56 25.7274 55.3792 22.8156 54.1731C19.9038 52.967 17.258 51.1992 15.0294 48.9706C12.8008 46.742 11.033 44.0962 9.82689 41.1844C8.62078 38.2726 8 35.1517 8 32C8 25.6348 10.5286 19.5303 15.0294 15.0294C19.5303 10.5286 25.6348 8 32 8C38.3652 8 44.4697 10.5286 48.9706 15.0294C53.4714 19.5303 56 25.6348 56 32Z"
            stroke="#A7C9FF"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Label text */}
      <div className="absolute left-[83px] top-[13px] w-[45px] h-[48px]">
        <span className="text-white font-inter text-base font-extrabold leading-[48px]">
          {label}
        </span>
      </div>

      {/* Percentage text */}
      <div className="absolute left-[66px] top-[49px] flex w-[145px] h-[48px] flex-col justify-center flex-shrink-0">
        <span className="text-white text-center font-inter text-[40px] font-extrabold leading-[48px]">
          {percentage}
        </span>
      </div>
    </div>
  );
};

export default MetricCardStudent;
