//Coconut-Frontend/src/pages/SignupPage.tsx
import React from 'react';
import MainBackground from '../components/main/MainBackground'; // 1. 레이아웃 틀을 가져옵니다.
import SigninCard from '../components/signup/SignupCard'; // 2. 내용물을 가져옵니다.

const SigninPage: React.FC = () => {
  return (
    // 3. MainBackground라는 '틀' 안에,
    <MainBackground hideHeaderButtons={true}>
      {/* 4. HeroSection이라는 '내용물'을 쏙 넣어줍니다. */}
      <SigninCard />
    </MainBackground>
  );
};

export default SigninPage;
