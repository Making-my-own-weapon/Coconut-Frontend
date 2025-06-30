import React from 'react';
import { Link } from 'react-router-dom';

const HeroSection: React.FC = () => {
  return (
    <div className="relative w-full">
      {/* Hero Content */}
      <div className="flex flex-col items-center px-4 sm:px-6 lg:px-8">
        {/* Main Title */}
        <div className="flex w-full max-w-[95vw] sm:max-w-[700px] lg:max-w-[800px] justify-center items-center flex-shrink-0 mt-10 sm:mt-16 lg:mt-20 mb-2 sm:mb-4 lg:mb-8">
          <h1 className="text-gray-900 text-center font-inter text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-wider w-full whitespace-nowrap">
            쉬운 코딩 교육 플랫폼
          </h1>
        </div>

        {/* Subtitle */}
        <div className="flex w-full max-w-[90vw] sm:max-w-[500px] lg:max-w-[600px] justify-center items-center flex-shrink-0 mb-2 sm:mb-4 lg:mb-6">
          <h2 className="text-blue-600 text-center font-inter text-xl sm:text-3xl lg:text-4xl font-bold leading-tight w-full whitespace-nowrap">
            지금 시작하세요
          </h2>
        </div>

        {/* Description */}
        <div className="flex w-full max-w-[95vw] sm:max-w-[600px] lg:max-w-[755px] justify-center items-center flex-shrink-0 mb-4 sm:mb-6 lg:mb-8">
          <p className="text-gray-600 text-center font-inter text-base sm:text-lg lg:text-xl font-normal leading-tight px-2 sm:px-4">
            실시간으로 분석하고 피드백하는 혁신적인 코딩 수업 플랫폼으로 더
            스마트하고 효과적인 프로그래밍 교육을 경험하세요.
          </p>
        </div>

        {/* CTA Button - 설명 아래로 이동 및 간격 조정 */}
        <Link to="/login">
          <div className="w-full flex justify-center mb-8 sm:mb-12 lg:mb-16">
            <div className="flex items-center gap-2 sm:gap-3 px-4 py-2 sm:px-8 sm:py-3 lg:px-12 lg:py-5 rounded-md bg-blue-600 shadow-lg">
              <img
                className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 flex-shrink-0 aspect-[25.12/26]"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/239c2969157815b2b145aa7da291e89855b3e081?width=50"
                alt="Coconut Logo"
              />
              <span className="text-white text-center font-inter text-base sm:text-xl lg:text-2xl font-semibold leading-[28px] sm:leading-[32px] lg:leading-[36px]">
                코코넛 시작하기
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default HeroSection;
