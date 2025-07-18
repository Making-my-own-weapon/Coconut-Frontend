import React from 'react';
import { useTeacherStore } from '../../store/teacherStore';

interface ReportHeaderProps {
  roomTitle?: string;
  userType?: 'teacher' | 'student'; // 사용자 타입 추가
}

// 방 제목을 전달하게 수정
const ReportHeader: React.FC<ReportHeaderProps> = ({ roomTitle, userType = 'student' }) => {
  return (
    <div className="w-full h-[73px] flex-shrink-0 absolute left-0 top-0">
      <div className="w-full h-[73px] flex-shrink-0 border-0 border-slate-600 bg-slate-800/50 backdrop-blur-[2px] absolute left-0 top-0"></div>

      {/* Room Info Badge */}
      <div className="min-w-[115px] max-w-[300px] h-[22px] flex-shrink-0 absolute left-48 top-[25px]">
        <div className="w-full h-[22px] flex-shrink-0 rounded-full border border-slate-00 absolute left-0 top-0"></div>
        <div className="flex items-center gap-1 absolute left-[9px] top-[3px] right-[9px] overflow-hidden">
          <div className="text-slate-300 font-inter text-xs font-semibold whitespace-nowrap">
            수업:
          </div>
          <div className="text-slate-300 font-inter text-xs font-semibold truncate">
            {roomTitle || '수업명 로딩중...'}
          </div>
        </div>
      </div>

      {/* User Badge - 사용자 타입에 따라 분기 */}
      <div
        className={`absolute left-[315px] top-[21px] inline-flex items-center gap-1 px-3 h-[30px] w-[84px] rounded-full ${
          userType === 'teacher'
            ? 'bg-gradient-to-r from-purple-600 to-purple-800'
            : 'bg-gradient-to-r from-blue-600 to-blue-800'
        }`}
      >
        {/* Icon - 사용자 타입에 따라 분기 */}
        {userType === 'teacher' ? (
          // Teacher (Graduation cap) icon
          <svg
            className="w-5 h-5 text-slate-50"
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
        ) : (
          // Student icon
          <svg
            className="w-5 h-5 text-slate-50"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
              stroke="#F8FAFC"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="7"
              r="4"
              stroke="#F8FAFC"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        <span className="text-slate-50 font-inter text-xs font-semibold absolute left-9 top-2">
          {userType === 'teacher' ? '선생님' : '학생'}
        </span>
      </div>

      {/* Logo */}
      <div className="inline-flex h-[73px] justify-end items-center flex-shrink-0 absolute left-0 top-0 w-full">
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
