// Graphiques pour les statistiques sport - Story 1.5
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

interface SportStatsChartsProps {
  data: any;
  type: 'progression' | 'distribution' | 'rpe' | 'duration';
  height?: number;
  className?: string;
}

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

export function SportStatsCharts({
  data,
  type,
  height = 300,
  className = '',
}: SportStatsChartsProps) {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <div
        className={`flex items-center justify-center h-${height} ${className}`}
      >
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">Aucune donnée disponible</p>
          <p className="text-sm">
            Les graphiques apparaîtront ici une fois que vous aurez des séances
          </p>
        </div>
      </div>
    );
  }

  const renderProgressionChart = () => {
    const chartData = Array.isArray(data) ? data : [];

    return (
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value, name) => [
              value,
              name === 'sessions'
                ? 'Séances'
                : name === 'totalDuration'
                  ? 'Durée (min)'
                  : name === 'averageRPE'
                    ? 'RPE Moyen'
                    : name,
            ]}
            labelFormatter={label => `Période: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="sessions"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  const renderDistributionChart = () => {
    const chartData = Object.entries(data || {}).map(([type, count]) => ({
      name:
        type === 'cardio'
          ? 'Cardio'
          : type === 'musculation'
            ? 'Musculation'
            : type === 'flexibility'
              ? 'Flexibilité'
              : 'Autre',
      value: count,
      type,
    }));

    return (
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name} ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={value => [value, 'Séances']}
            labelFormatter={label => `Type: ${label}`}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  const renderRPEChart = () => {
    const chartData = Array.isArray(data) ? data : [];

    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis tick={{ fontSize: 12 }} domain={[0, 10]} />
          <Tooltip
            formatter={value => [value, 'RPE Moyen']}
            labelFormatter={label => `Période: ${label}`}
          />
          <Bar dataKey="averageRPE" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderDurationChart = () => {
    const chartData = Array.isArray(data) ? data : [];

    return (
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={value => `${value}min`}
          />
          <Tooltip
            formatter={value => [value, 'Durée (min)']}
            labelFormatter={label => `Période: ${label}`}
          />
          <Bar dataKey="totalDuration" fill="#10B981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'progression':
        return renderProgressionChart();
      case 'distribution':
        return renderDistributionChart();
      case 'rpe':
        return renderRPEChart();
      case 'duration':
        return renderDurationChart();
      default:
        return renderProgressionChart();
    }
  };

  return <div className={`w-full ${className}`}>{renderChart()}</div>;
}

// Composant pour les graphiques de comparaison
export function SportComparisonCharts({
  currentData,
  previousData,
  height = 300,
}: {
  currentData: any;
  previousData: any;
  height?: number;
}) {
  const comparisonData = [
    {
      metric: 'Séances',
      current: currentData?.total_sessions || 0,
      previous: previousData?.total_sessions || 0,
    },
    {
      metric: 'Durée (h)',
      current:
        Math.round(((currentData?.total_duration_minutes || 0) / 60) * 10) / 10,
      previous:
        Math.round(((previousData?.total_duration_minutes || 0) / 60) * 10) /
        10,
    },
    {
      metric: 'RPE Moyen',
      current: currentData?.average_rpe || 0,
      previous: previousData?.average_rpe || 0,
    },
    {
      metric: 'Fréquence',
      current: currentData?.weekly_frequency || 0,
      previous: previousData?.weekly_frequency || 0,
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={comparisonData} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" tick={{ fontSize: 12 }} />
        <YAxis
          type="category"
          dataKey="metric"
          tick={{ fontSize: 12 }}
          width={100}
        />
        <Tooltip
          formatter={(value, name) => [
            value,
            name === 'current' ? 'Période actuelle' : 'Période précédente',
          ]}
        />
        <Bar
          dataKey="current"
          fill="#3B82F6"
          name="current"
          radius={[0, 4, 4, 0]}
        />
        <Bar
          dataKey="previous"
          fill="#94A3B8"
          name="previous"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
