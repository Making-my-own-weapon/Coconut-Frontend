//Coconut-Frontend/src/pages/MainPage.tsx
import React from 'react';
import MainBackground from '../components/main/MainBackground'; // 1. 레이아웃 틀을 가져옵니다.
import HeroSection from '../components/main/HeroSection'; // 2. 내용물을 가져옵니다.
import FeatureCards from '../components/main/FeatureCards'; // FeatureCards 추가

const MainPage: React.FC = () => {
  return (
    // 3. MainBackground라는 '틀' 안에,
    <MainBackground hideHeaderButtons={true}>
      <div className="flex flex-col min-h-screen justify-start items-center w-full px-2 sm:px-0 pt-0 sm:pt-8 lg:pt-16">
        <HeroSection />
        <FeatureCards />
      </div>
    </MainBackground>
  );
};

export default MainPage;
