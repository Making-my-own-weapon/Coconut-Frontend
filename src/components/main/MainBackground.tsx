import React from 'react';
import Header from '../common/Header'; // Header를 여기서 직접 불러옵니다.

interface MainBackgroundProps {
  children?: React.ReactNode;
}

const MainBackground: React.FC<MainBackgroundProps> = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full">
      {/* Gradient Background Layer */}
      <div
        className="absolute inset-0 -z-10 w-full h-full"
        style={{
          background: 'linear-gradient(90deg, #EFF6FF 100%, #F9FAFB 0%)',
        }}
      />

      {/* Content Container */}
      <div className="relative z-0">
        <Header />
        <main>
          {/* 여기에 페이지의 실제 내용이 들어옵니다. */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainBackground;
