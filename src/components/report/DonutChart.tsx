import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Chart.js 요소들 등록
ChartJS.register(ArcElement, Tooltip, Legend);

export interface DonutChartProps {
  data: {
    name: string;
    count: number;
    color: string;
  }[];
  title?: string;
  className?: string;
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  title = '카테고리별 성과',
  className = '',
}) => {
  const chartData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        data: data.map((item) => item.count),
        backgroundColor: data.map((item) => item.color),
        borderColor: data.map((item) => item.color),
        borderWidth: 2,
        hoverBackgroundColor: data.map((item) => item.color + 'CC'),
        hoverBorderColor: data.map((item) => item.color),
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#ffffff',
          font: {
            size: 12,
            family: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1,
        titleFont: {
          size: 14,
          family: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
        },
        bodyFont: {
          size: 12,
          family: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
        },
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value}개 (${percentage}%)`;
          },
        },
      },
    },
    cutout: '60%',
    elements: {
      arc: {
        borderWidth: 2,
      },
    },
  };

  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      {title && (
        <h3
          className="text-white text-xl font-bold mb-4 text-center"
          style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif' }}
        >
          {title}
        </h3>
      )}
      <div className="flex-1 relative">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

export default DonutChart;
