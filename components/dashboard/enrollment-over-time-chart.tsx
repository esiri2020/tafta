import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from 'recharts';

const colors = {
  primary: '#0ea5e9',
  secondary: '#f97316',
  tertiary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  gender: {
    male: '#0ea5e9',
    female: '#d946ef',
  },
};

const formatNumber = (num: number): string => {
  return Number(num).toLocaleString();
};

interface EnrollmentOverTimeChartProps {
  data: {
    date: Date | null;
    male_count: number;
    female_count: number;
  }[];
}

export const EnrollmentOverTimeChart: React.FC<EnrollmentOverTimeChartProps> = ({ data }) => {
  if (!data) return null;

  const chartData = data.map(item => ({
    date: item.date ? new Date(item.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }) : '',
    male: Number(item.male_count),
    female: Number(item.female_count),
  }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Enrollment Completion Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px] min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="colorMale" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.gender.male} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors.gender.male} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorFemale" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.gender.female} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={colors.gender.female} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
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
                formatter={value => formatNumber(value as number)}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="male"
                name="Male"
                stroke={colors.gender.male}
                fillOpacity={1}
                fill="url(#colorMale)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="female"
                name="Female"
                stroke={colors.gender.female}
                fillOpacity={1}
                fill="url(#colorFemale)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}; 