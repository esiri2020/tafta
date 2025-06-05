import React, { useMemo } from 'react';
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
} from 'recharts';

interface EnrollmentData {
  date: string;
  male_count: number;
  female_count: number;
}

interface EnrollmentOverTimeChartProps {
  data: EnrollmentData[];
}

const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const EnrollmentOverTimeChart: React.FC<EnrollmentOverTimeChartProps> = ({ data }) => {
  if (!data?.length) return null;

  // Memoize chart data transformation
  const chartData = useMemo(() => {
    return data.map(item => ({
      date: formatDate(item.date),
      male: item.male_count,
      female: item.female_count,
      total: item.male_count + item.female_count,
    }));
  }, [data]);

  // Memoize the custom tooltip component
  const CustomTooltip = useMemo(() => {
    return ({ active, payload, label }: any) => {
      if (active && payload && payload.length) {
        return (
          <div className="bg-white p-3 border border-gray-200 shadow-md rounded-md">
            <p className="font-semibold">{label}</p>
            <p className="text-sm">
              Total: <span className="font-medium">{formatNumber(payload[0].value)}</span>
            </p>
            {payload[0].payload.male > 0 && (
              <p className="text-sm">
                Male: <span className="font-medium">{formatNumber(payload[0].payload.male)}</span>
              </p>
            )}
            {payload[0].payload.female > 0 && (
              <p className="text-sm">
                Female: <span className="font-medium">{formatNumber(payload[0].payload.female)}</span>
              </p>
            )}
          </div>
        );
      }
      return null;
    };
  }, []);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Enrollment Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{fontSize: 12}}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={formatNumber}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={CustomTooltip} />
              <Area
                type="monotone"
                dataKey="total"
                name="Total Enrollments"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}; 