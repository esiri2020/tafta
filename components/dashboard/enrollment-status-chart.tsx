import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

const colors = {
  active: '#10b981',
  inactive: '#f59e0b',
  certified: '#3b82f6',
};

const formatNumber = (num: number): string => {
  return Number(num).toLocaleString();
};

interface EnrollmentStatusChartProps {
  data: {
    active: number;
    inactive: number;
    certified: number;
  };
}

export const EnrollmentStatusChart: React.FC<EnrollmentStatusChartProps> = ({ data }) => {
  if (!data) return null;

  const chartData = [
    { name: 'Active', value: Number(data.active) },
    { name: 'Inactive', value: Number(data.inactive) },
    { name: 'Certified', value: Number(data.certified) },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Enrollment Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px] min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={colors[entry.name.toLowerCase() as keyof typeof colors]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={value => formatNumber(value as number)}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}; 