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
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const colors = {
  gender: {
    male: '#0ea5e9',
    female: '#d946ef',
  },
};

const formatNumber = (num: number): string => {
  return Number(num).toLocaleString();
};

interface LocationBreakdownProps {
  data: {
    location: string;
    courses: {
      course_name: string;
      male_enrollments: number;
      female_enrollments: number;
    }[];
  }[];
}

export const LocationBreakdown: React.FC<LocationBreakdownProps> = ({ data }) => {
  if (!data) return null;

  const chartData = data.flatMap(location =>
    location.courses.map(course => ({
      name: `${location.location} - ${course.course_name}`,
      male: Number(course.male_enrollments),
      female: Number(course.female_enrollments),
    }))
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Location & Course Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[400px] min-h-[400px]">
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
                angle={-45}
                textAnchor="end"
                height={100}
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
              <Bar 
                dataKey="male" 
                name="Male"
                fill={colors.gender.male}
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Bar 
                dataKey="female" 
                name="Female"
                fill={colors.gender.female}
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}; 