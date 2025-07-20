import React from 'react';
import Lottie from 'lottie-react';
// LottieFiles에서 다운로드한 JSON 파일을 import 합니다.
import animationData from '../../assets/animations/Blue Working Cat Animation.json';

const LoadingAnimation = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-screen bg-slate-900">
      <Lottie animationData={animationData} loop={true} style={{ width: 200, height: 200 }} />
      <p className="text-white mt-4 text-lg">리포트를 생성 중입니다...</p>
    </div>
  );
};

export default LoadingAnimation;
