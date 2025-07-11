import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// 컴포넌트가 받을 props 타입을 정의합니다.
interface BarChartProps {
  options: ChartOptions<'bar'>;
  data: ChartData<'bar'>;
}

// props로 options와 data를 받아 차트를 렌더링합니다.
const BarChart: React.FC<BarChartProps> = ({ options, data }) => {
  return <Bar options={options} data={data} />;
};

export default BarChart;
