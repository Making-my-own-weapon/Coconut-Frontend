import React from 'react';

const ReportHeader: React.FC = () => {
  return (
    <div className="w-full h-[73px] flex-shrink-0 absolute left-0 top-0">
      <div className="w-full h-[73px] flex-shrink-0 border-0 border-slate-600 bg-slate-800/50 backdrop-blur-[2px] absolute left-0 top-0"></div>

      {/* Room Info Badge */}
      <div className="w-[115px] h-[22px] flex-shrink-0 absolute left-48 top-[25px]">
        <div className="w-[115px] h-[22px] flex-shrink-0 rounded-full border border-slate-600 absolute left-0 top-0"></div>
        <div className="w-[98px] h-4 flex-shrink-0 absolute left-[9px] top-[3px]">
          <div className="text-slate-300 font-inter text-xs font-semibold leading-4 absolute left-0 top-0 w-[26px] h-4">
            수업:
          </div>
          <div className="text-slate-300 font-inter text-xs font-semibold leading-4 absolute left-[26px] top-0 w-[72px] h-4">
            83rg8fvecjp
          </div>
        </div>
      </div>

      {/* Teacher Badge */}
      <div className="w-[83px] h-[30px] flex-shrink-0 absolute left-[315px] top-[21px]">
        <div className="w-[83px] h-[30px] rounded-[15px] bg-gradient-to-r from-purple-600 to-purple-800 absolute left-0 top-0"></div>
        {/* Graduation cap icon */}
        <svg
          className="w-6 h-6 flex-shrink-0 absolute left-2 top-[3px]"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22 10L12 5L2 10L12 15L22 10Z"
            stroke="#F8FAFC"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M6 12V16C6 16.7956 6.63214 17.5587 7.75736 18.1213C8.88258 18.6839 10.4087 19 12 19C13.5913 19 15.1174 18.6839 16.2426 18.1213C17.3679 17.5587 18 16.7956 18 16V12"
            stroke="#F8FAFC"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M22 10V13"
            stroke="#F8FAFC"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-slate-50 font-inter text-xs font-semibold absolute left-8 top-2">
          선생님
        </span>
      </div>

      {/* Logo */}
      <div className="inline-flex h-[73px] justify-end items-center flex-shrink-0 absolute left-0 top-0 w-44">
        <img
          className="w-[187px] h-[73px] absolute left-0 top-0"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/e2b6d2604ebed166d89ab22af652c8a65e3d0763?width=375"
          alt="코코넛 로고"
        />
      </div>
    </div>
  );
};

export default ReportHeader;
