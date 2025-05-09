import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { VoteCount } from '../contexts/VotingContext';
import { CHART_COLORS } from '../config/constants';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

interface ResultsChartProps {
  title: string;
  data: VoteCount[];
  type: 'king' | 'queen';
  chartType?: 'pie' | 'bar';
}

const ResultsChart: React.FC<ResultsChartProps> = ({ 
  title, 
  data, 
  type,
  chartType = 'pie' 
}) => {
  // Ensure we have data to display
  if (!data || data.length === 0) {
    return (
      <div className="bg-elegant-900 p-6 rounded-lg text-center">
        <h3 className="font-playfair text-xl mb-4">{title}</h3>
        <p className="text-elegant-400 italic">Aucune donnée disponible</p>
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => item.candidateName),
    datasets: [
      {
        data: data.map(item => item.voteCount),
        backgroundColor: type === 'king' ? CHART_COLORS.kings : CHART_COLORS.queens,
        borderColor: 'rgba(18, 18, 18, 0.8)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            family: 'Raleway',
          },
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} votes (${percentage}%)`;
          }
        }
      }
    },
  };

  const barOptions = {
    ...options,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        }
      },
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
        },
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="bg-elegant-900 p-6 rounded-lg">
      <h3 className="font-playfair text-xl mb-6 text-center">{title}</h3>
      {chartType === 'pie' ? (
        <Pie data={chartData} options={options} />
      ) : (
        <Bar data={chartData} options={barOptions} />
      )}
    </div>
  );
};

export default ResultsChart;