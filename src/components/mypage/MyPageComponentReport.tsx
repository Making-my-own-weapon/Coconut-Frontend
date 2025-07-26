import React from 'react';

interface MyPageComponentReportProps {
  score: number;
  className?: string;
}

const MyPageComponentReport: React.FC<MyPageComponentReportProps> = ({ score, className = '' }) => {
  return (
    <div
      className={`w-full max-w-[108px] h-[140px] bg-white relative flex-shrink-0 ${className}`}
      role="img"
      aria-label={`Report score: ${score}`}
    >
      {/* Gray header bar */}
      <div className="w-full h-[14px] bg-gray-300" />

      {/* Score display */}
      <div className="px-3 pt-5 pb-2">
        <span className="text-2xl font-bold text-black leading-none font-['Inter']">{score}</span>
      </div>

      {/* Wavy lines SVG */}
      <div className="absolute bottom-0 left-0 right-0 h-[87px] flex items-end">
        <svg
          className="w-full h-full"
          viewBox="0 0 108 87"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          {/* First wavy line */}
          <path
            d="M12 15C12.954 13.4942 16.0069 10.5955 20.5862 11.0473C26.3103 11.6119 22.3034 15 30.3172 15C38.331 15 31.4621 11.0473 40.0483 11.0473C48.6345 11.0473 45.7724 15 50.3517 15C54.931 15 56 11.0473 63.5 11.0473C71 11.0473 69.9792 15 76 15C82 15 84 11.0473 88 11.0473C92 11.0473 93.5 12.5 95 15"
            stroke="black"
            strokeLinecap="round"
            fill="none"
          />

          {/* Second wavy line */}
          <path
            d="M12 30C12.954 28.4942 13.9207 25.5955 18.5 26.0473C24.2241 26.6119 21.4862 30 29.5 30C36 30 34.9138 26.0473 43.5 26.0473C52.0862 26.0473 48.927 29.7593 53.5 30C63 30.5 62 26.0473 67 26.0473C72 26.0473 71.4792 30 77.5 30C83.5 30 83.5 26.0473 86 26.0473C88.5 26.0473 93.5 28 95 30"
            stroke="black"
            strokeLinecap="round"
            fill="none"
          />

          {/* Third wavy line */}
          <path
            d="M12 44.9999C12 41.9999 13.9447 40.6507 18.5 39.9999C22 39.4999 19.4862 44.9999 27.5 44.9999C35.5138 44.9999 29.4435 40.713 38 39.9999C44 39.4999 44.4207 44.9999 49 44.9999C59 44.9999 57 41.0472 61 41.0472C65 41.0472 66.9792 44.9999 73 44.9999C81 44.9999 78.5 42.0944 82 41.0472C85.5 39.9999 92 38.9999 95 44.9999"
            stroke="black"
            fill="none"
          />

          {/* Fourth wavy line */}
          <path
            d="M12 59C12.954 57.4942 16.0069 54.5955 20.5862 55.0473C26.3103 55.6119 22.3034 59 30.3172 59C38.331 59 31.4621 55.0473 40.0483 55.0473C48.6345 55.0473 45.7724 59 50.3517 59C54.931 59 56 55.0473 63.5 55.0473C71 55.0473 69.9792 59 76 59C82 59 84 55.0473 88 55.0473C92 55.0473 93.5 56.5 95 59"
            stroke="black"
            strokeLinecap="round"
            fill="none"
          />

          {/* Fifth wavy line */}
          <path
            d="M12 74C12.954 72.4942 13.9207 69.5955 18.5 70.0473C24.2241 70.6119 21.4862 74 29.5 74C36 74 34.9138 70.0473 43.5 70.0473C52.0862 70.0473 48.927 73.7593 53.5 74C63 74.5 62 70.0473 67 70.0473C72 70.0473 71.4792 74 77.5 74C83.5 74 83.5 70.0473 86 70.0473C88.5 70.0473 93.5 72 95 74"
            stroke="black"
            strokeLinecap="round"
            fill="none"
          />

          {/* Sixth wavy line */}
          <path
            d="M12 89C12 86 13.9447 84.651 18.5 84C22 83.5 19.4862 89 27.5 89C35.5138 89 29.4435 84.713 38 84C44 83.5 44.4207 89 49 89C59 89 57 85.047 61 85.047C65 85.047 66.9792 89 73 89C81 89 78.5 86.094 82 85.047C85.5 84 92 83 95 89"
            stroke="black"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
};

export default MyPageComponentReport;
