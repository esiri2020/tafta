import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const colors = {
  primary: '#0ea5e9',
  secondary: '#f97316',
  tertiary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
};

const formatNumber = num => {
  return Number.parseInt(num).toLocaleString();
};

export const AgeRangeGraph = ({ data }) => {
  if (!data) return null;

  const chartData = data.map(item => ({
    name: item.ageRange,
    value: Number.parseInt(item.count),
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Age Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px] min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatNumber}
              />
              <Tooltip 
                formatter={value => formatNumber(value)}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              />
              <Bar 
                dataKey="value" 
                name="Applicants" 
                fill={colors.primary}
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
