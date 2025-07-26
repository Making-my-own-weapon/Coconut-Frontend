//src/components/main/FeatureCards.tsx
import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  iconColor: string;
  icon: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, iconColor, icon }) => {
  return (
    <div className="w-full max-w-[90vw] sm:max-w-[320px] lg:max-w-[363px] h-[200px] sm:h-[240px] lg:h-[272px] relative">
      <div className="w-full h-full flex-shrink-0 rounded-lg border border-gray-200 bg-white shadow-sm absolute left-0 top-0" />
      <div
        className={`w-16 h-16 flex-shrink-0 rounded-2xl shadow-lg absolute left-1/2 top-[33px] transform -translate-x-1/2 flex items-center justify-center`}
        style={{ backgroundColor: iconColor }}
      >
        {icon}
      </div>
      <div className="text-gray-900 text-center font-inter text-base sm:text-lg lg:text-xl font-bold leading-6 sm:leading-7 absolute left-1/2 top-[90px] sm:top-[105px] lg:top-[121px] transform -translate-x-1/2 whitespace-nowrap">
        {title}
      </div>
      <div className="w-[80vw] sm:w-[220px] lg:w-[283px] text-gray-600 text-center font-inter text-sm sm:text-base font-normal leading-[20px] sm:leading-[24px] lg:leading-[26px] absolute left-1/2 top-[140px] sm:top-[150px] lg:top-[165px] transform -translate-x-1/2">
        {description}
      </div>
    </div>
  );
};

const LightningIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3.99999 14C3.81076 14.0006 3.62522 13.9476 3.46495 13.847C3.30467 13.7464 3.17623 13.6024 3.09454 13.4317C3.01286 13.261 2.98129 13.0706 3.00349 12.8827C3.0257 12.6947 3.10077 12.517 3.21999 12.37L13.12 2.17C13.1943 2.08428 13.2955 2.02636 13.407 2.00574C13.5185 1.98511 13.6337 2.00302 13.7337 2.05651C13.8337 2.11 13.9126 2.1959 13.9573 2.30011C14.0021 2.40432 14.0101 2.52065 13.98 2.63L12.06 8.65C12.0034 8.80153 11.9844 8.96452 12.0046 9.12501C12.0248 9.2855 12.0837 9.43868 12.1761 9.57143C12.2685 9.70418 12.3918 9.81252 12.5353 9.88716C12.6788 9.96181 12.8382 10.0005 13 10H20C20.1892 9.99936 20.3748 10.0524 20.535 10.153C20.6953 10.2536 20.8238 10.3976 20.9054 10.5683C20.9871 10.739 21.0187 10.9294 20.9965 11.1173C20.9743 11.3053 20.8992 11.483 20.78 11.63L10.88 21.83C10.8057 21.9157 10.7045 21.9736 10.593 21.9943C10.4815 22.0149 10.3663 21.997 10.2663 21.9435C10.1663 21.89 10.0874 21.8041 10.0427 21.6999C9.99791 21.5957 9.98991 21.4794 10.02 21.37L11.94 15.35C11.9966 15.1985 12.0156 15.0355 11.9954 14.875C11.9752 14.7145 11.9163 14.5613 11.8239 14.4286C11.7315 14.2958 11.6082 14.1875 11.4647 14.1128C11.3212 14.0382 11.1617 13.9995 11 14H3.99999Z"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PeopleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H6C4.93913 15 3.92172 15.4214 3.17157 16.1716C2.42143 16.9217 2 17.9391 2 19V21"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22 21V19C21.9993 18.1137 21.7044 17.2528 21.1614 16.5523C20.6184 15.8519 19.8581 15.3516 19 15.13"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 3.13C16.8604 3.3503 17.623 3.8507 18.1676 4.55231C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const BrainIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M11.9998 5C12.001 4.60003 11.9222 4.20386 11.768 3.8348C11.6139 3.46573 11.3874 3.13122 11.1021 2.85094C10.8168 2.57066 10.4783 2.35027 10.1065 2.20273C9.73472 2.05519 9.33721 1.98347 8.93733 1.99181C8.53744 2.00014 8.14326 2.08836 7.77797 2.25126C7.41268 2.41417 7.08365 2.64847 6.81023 2.9404C6.53682 3.23233 6.32454 3.57598 6.18588 3.95115C6.04722 4.32632 5.98499 4.72542 6.00283 5.125C5.41503 5.27613 4.86933 5.55905 4.40706 5.95231C3.94479 6.34557 3.57807 6.83887 3.33467 7.39485C3.09128 7.95082 2.97759 8.55489 3.00222 9.16131C3.02685 9.76773 3.18915 10.3606 3.47683 10.895C2.97101 11.3059 2.57326 11.8342 2.31817 12.4339C2.06308 13.0336 1.95839 13.6866 2.01319 14.336C2.068 14.9854 2.28065 15.6115 2.63264 16.16C2.98462 16.7085 3.46529 17.1627 4.03283 17.483C3.96275 18.0252 4.00457 18.5761 4.15572 19.1015C4.30686 19.627 4.56413 20.1158 4.91161 20.538C5.2591 20.9601 5.68944 21.3065 6.17605 21.5558C6.66266 21.805 7.19521 21.9519 7.74081 21.9873C8.28641 22.0227 8.83347 21.9459 9.34822 21.7616C9.86296 21.5773 10.3345 21.2894 10.7336 20.9158C11.1327 20.5421 11.451 20.0906 11.6688 19.5891C11.8866 19.0876 11.9992 18.5467 11.9998 18V5Z"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12 5C11.9988 4.60003 12.0776 4.20386 12.2318 3.8348C12.386 3.46573 12.6124 3.13122 12.8977 2.85094C13.1831 2.57066 13.5216 2.35027 13.8934 2.20273C14.2651 2.05519 14.6626 1.98347 15.0625 1.99181C15.4624 2.00014 15.8566 2.08836 16.2219 2.25126C16.5872 2.41417 16.9162 2.64847 17.1896 2.9404C17.463 3.23233 17.6753 3.57598 17.814 3.95115C17.9526 4.32632 18.0149 4.72542 17.997 5.125C18.5848 5.27613 19.1305 5.55905 19.5928 5.95231C20.0551 6.34557 20.4218 6.83887 20.6652 7.39485C20.9086 7.95082 21.0223 8.55489 20.9976 9.16131C20.973 9.76773 20.8107 10.3606 20.523 10.895C21.0288 11.3059 21.4266 11.8342 21.6817 12.4339C21.9368 13.0336 22.0415 13.6866 21.9867 14.336C21.9318 14.9854 21.7192 15.6115 21.3672 16.16C21.0152 16.7085 20.5345 17.1627 19.967 17.483C20.0371 18.0252 19.9953 18.5761 19.8441 19.1015C19.693 19.627 19.4357 20.1158 19.0882 20.538C18.7407 20.9601 18.3104 21.3065 17.8238 21.5558C17.3372 21.805 16.8046 21.9519 16.259 21.9873C15.7134 22.0227 15.1664 21.9459 14.6516 21.7616C14.1369 21.5773 13.6654 21.2894 13.2663 20.9158C12.8671 20.5421 12.5488 20.0906 12.331 19.5891C12.1133 19.0876 12.0006 18.5467 12 18V5Z"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 13C14.1604 12.7047 13.4273 12.167 12.8933 11.455C12.3593 10.743 12.0485 9.88867 12 9C11.9515 9.88867 11.6407 10.743 11.1067 11.455C10.5727 12.167 9.83956 12.7047 9 13"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.5991 6.5C17.8411 6.08059 17.978 5.60882 17.9981 5.125"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.00293 5.125C6.0227 5.60873 6.15926 6.0805 6.40093 6.5"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.47705 10.896C3.65999 10.747 3.85575 10.6145 4.06205 10.5"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.938 10.5C20.1443 10.6145 20.34 10.747 20.523 10.896"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.0002 18C5.31103 18.0003 4.63347 17.8226 4.0332 17.484"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.967 17.484C19.3667 17.8226 18.6892 18.0003 18 18"
      stroke="white"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FeatureCards: React.FC = () => {
  const features = [
    {
      title: '실시간 협업',
      description: '선생님과 학생이 실시간으로 코드를 공유하고 소통할 수 있는 협업 환경',
      iconColor: '#0891B2',
      icon: <LightningIcon />,
    },
    {
      title: '그리드 뷰 관리',
      description: '모든 학생의 진행 상황을 한눈에 보고 개별 지도가 가능한 직관적 인터페이스',
      iconColor: '#EA580C',
      icon: <PeopleIcon />,
    },
    {
      title: '실시간 분석',
      description:
        '학생의 코드를 실시간으로 분석하여 복잡도, 효율성, 개선점을 즉시 제공하는 스마트 피드백',
      iconColor: '#9333EA',
      icon: <BrainIcon />,
    },
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="w-full max-w-[98vw] sm:max-w-[700px] lg:max-w-[1255px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-16 gap-y-8 sm:gap-y-12 lg:gap-y-24 place-items-center">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            title={feature.title}
            description={feature.description}
            iconColor={feature.iconColor}
            icon={feature.icon}
          />
        ))}
      </div>
    </div>
  );
};

export default FeatureCards;
