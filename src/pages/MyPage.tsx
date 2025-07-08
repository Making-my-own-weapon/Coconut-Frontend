import React from 'react';
import MyPageBackground from '../components/mypage/MyPageBackground';
import PersonalInfoCard from '../components/mypage/PersonalInfoCard';
import ReportsSection from '../components/mypage/ReportsSection';

const MyPage: React.FC = () => {
  return (
    <MyPageBackground>
      <div className="flex flex-col xl:flex-row gap-6 xl:gap-9 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-[109px] pt-6 lg:pt-12 pb-8">
        <PersonalInfoCard />
        <ReportsSection />
      </div>
    </MyPageBackground>
  );
};

export default MyPage;
