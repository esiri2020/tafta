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
  Cell,
  Legend,
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
  status: {
    active: '#10b981',
    inactive: '#f97316',
    certified: '#3b82f6',
  },
};

const formatNumber = num => {
  return Number.parseInt(num).toLocaleString();
};

export const EnrollmentStatus = ({ data }) => {
  if (!data) return null;

  const statusData = [
    { name: 'Active', value: Number.parseInt(data.active_enrollees) },
    { name: 'Inactive', value: Number.parseInt(data.inactive_enrollments) },
    { name: 'Certified', value: Number.parseInt(data.certified_enrollees) },
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Enrollment Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[300px] min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={statusData}
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
              <Legend />
              <Bar 
                dataKey="value" 
                name="Enrollees"
                radius={[4, 4, 0, 0]}
                barSize={40}
              >
                {statusData.map((entry, index) => {
                  const statusKey = entry.name.toLowerCase();
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={colors.status[statusKey]}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
