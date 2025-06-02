import React, { useMemo } from 'react';
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

interface CourseData {
  course_name: string;
  total_enrollments: number;
  male_enrollments: number;
  female_enrollments: number;
}

interface CourseDistributionChartProps {
  data: CourseData[];
}

// Generate a consistent color palette for courses
const generateCourseColors = (courses: string[]) => {
  const colors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe',
    '#00c49f', '#ffbb28', '#ff8042', '#a4de6c', '#d0ed57',
    '#83a6ed', '#8dd1e1', '#ffd666', '#ff7c43', '#665191',
    '#2f4b7c', '#665191', '#a05195', '#d45087', '#f95d6a'
  ];
  
  return courses.reduce((acc, course, index) => {
    acc[course] = colors[index % colors.length];
    return acc;
  }, {} as Record<string, string>);
};

const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

export const CourseDistributionChart: React.FC<CourseDistributionChartProps> = ({ data }) => {
  if (!data?.length) return null;

  // Memoize chart data transformation
  const chartData = useMemo(() => {
    return data.map(course => ({
      name: course.course_name,
      total: course.total_enrollments,
      male: course.male_enrollments,
      female: course.female_enrollments,
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
        <CardTitle>Course Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 100,
              }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
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
              <Bar
                dataKey="total"
                name="Total Enrollments"
                fill="#8884d8"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Custom Legend */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {data.map((course, index) => (
            <div key={course.course_name} className="flex items-center space-x-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{backgroundColor: generateCourseColors([course.course_name])[course.course_name]}}
              />
              <span className="truncate" title={course.course_name}>
                {course.course_name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};