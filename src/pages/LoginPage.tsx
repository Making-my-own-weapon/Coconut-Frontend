import React from 'react';
import MainBackground from '../components/main/MainBackground'; // 1. 레이아웃 틀을 가져옵니다.
import LoginCard from '../components/login/LoginCard'; // 2. 로그인 카드 내용물을 가져옵니다.

const LoginPage: React.FC = () => {
  return (
    // 3. MainBackground라는 '틀' 안에,
    <MainBackground>
      {/* 4. LoginCard라는 '내용물'을 쏙 넣어줍니다. */}
      <LoginCard />
    </MainBackground>
  );
};

export default LoginPage;
