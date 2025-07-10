import React from 'react';
import Header from '../common/Header';

interface MyPageBackgroundProps {
  children?: React.ReactNode;
}

const MyPageBackground: React.FC<MyPageBackgroundProps> = ({ children }) => {
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
        <main className="pt-[85px]">{children}</main>
      </div>
    </div>
  );
};

export default MyPageBackground;
