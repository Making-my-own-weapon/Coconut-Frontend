import React from 'react';

interface ReportChartProps {
  score: string;
}

const ReportChart: React.FC<ReportChartProps> = ({ score }) => {
  return (
    <div className="w-full aspect-[108/140] bg-white rounded-lg relative border border-gray-200">
      {/* Score Display */}
      <div className="absolute top-4 left-3 text-black font-bold text-lg sm:text-xl md:text-2xl font-inter">
        {score}
      </div>

      {/* Chart Lines */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 108 140"
        preserveAspectRatio="none"
      >
        {/* Chart Line 1 */}
        <path
          d="M12 53C12.954 51.4942 16.0069 48.5955 20.5862 49.0473C26.3103 49.6119 22.3034 53 30.3172 53C38.331 53 31.4621 49.0473 40.0483 49.0473C48.6345 49.0473 45.7724 53 50.3517 53C54.931 53 56 49.0473 63.5 49.0473C71 49.0473 69.9792 53 76 53C82 53 84 49.0473 88 49.0473C92 49.0473 93.5 50.5 95 53"
          stroke="black"
          strokeLinecap="round"
          fill="none"
          strokeWidth="1"
        />

        {/* Chart Line 2 */}
        <path
          d="M12 97C12.954 95.4942 16.0069 92.5955 20.5862 93.0473C26.3103 93.6119 22.3034 97 30.3172 97C38.331 97 31.4621 93.0473 40.0483 93.0473C48.6345 93.0473 45.7724 97 50.3517 97C54.931 97 56 93.0473 63.5 93.0473C71 93.0473 69.9792 97 76 97C82 97 84 93.0473 88 93.0473C92 93.0473 93.5 94.5 95 97"
          stroke="black"
          strokeLinecap="round"
          fill="none"
          strokeWidth="1"
        />

        {/* Chart Line 3 */}
        <path
          d="M12 68C12.954 66.4942 13.9207 63.5955 18.5 64.0473C24.2241 64.6119 21.4862 68 29.5 68C36 68 34.9138 64.0473 43.5 64.0473C52.0862 64.0473 48.927 67.7593 53.5 68C63 68.5 62 64.0473 67 64.0473C72 64.0473 71.4792 68 77.5 68C83.5 68 83.5 64.0473 86 64.0473C88.5 64.0473 93.5 66 95 68"
          stroke="black"
          strokeLinecap="round"
          fill="none"
          strokeWidth="1"
        />

        {/* Chart Line 4 */}
        <path
          d="M12 112C12.954 110.494 13.9207 107.596 18.5 108.047C24.2241 108.612 21.4862 112 29.5 112C36 112 34.9138 108.047 43.5 108.047C52.0862 108.047 48.927 111.759 53.5 112C63 112.5 62 108.047 67 108.047C72 108.047 71.4792 112 77.5 112C83.5 112 83.5 108.047 86 108.047C88.5 108.047 93.5 110 95 112"
          stroke="black"
          strokeLinecap="round"
          fill="none"
          strokeWidth="1"
        />

        {/* Chart Line 5 */}
        <path
          d="M12 82.9999C12 79.9999 13.9447 78.6507 18.5 77.9999C22 77.4999 19.4862 82.9999 27.5 82.9999C35.5138 82.9999 29.4435 78.713 38 77.9999C44 77.4999 44.4207 82.9999 49 82.9999C59 82.9999 57 79.0472 61 79.0472C65 79.0472 66.9792 82.9999 73 82.9999C81 82.9999 78.5 80.0944 82 79.0472C85.5 77.9999 92 76.9999 95 82.9999"
          stroke="black"
          fill="none"
          strokeWidth="1"
        />

        {/* Chart Line 6 */}
        <path
          d="M12 127C12 124 13.9447 122.651 18.5 122C22 121.5 19.4862 127 27.5 127C35.5138 127 29.4435 122.713 38 122C44 121.5 44.4207 127 49 127C59 127 57 123.047 61 123.047C65 123.047 66.9792 127 73 127C81 127 78.5 124.094 82 123.047C85.5 122 92 121 95 127"
          stroke="black"
          fill="none"
          strokeWidth="1"
        />
      </svg>

      {/* Header bar at top */}
      <div className="absolute top-0 left-0 w-full h-[14px] bg-gray-300 rounded-t-lg"></div>
    </div>
  );
};

export default ReportChart;
