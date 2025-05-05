import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Progress } from '@/components/ui/progress';

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
  completion: {
    '0-25%': '#ef4444',
    '26-50%': '#f59e0b',
    '51-75%': '#0ea5e9',
    '76-100%': '#10b981',
  },
};

const formatNumber = num => {
  return Number.parseInt(num).toLocaleString();
};

export const CohortDashboard = ({ data }) => {
  if (!data) return null;

  // Prepare data for charts
  const statusData = [
    { name: 'Active', value: Number.parseInt(data.active_enrollees) },
    { name: 'Inactive', value: Number.parseInt(data.inactive_enrollments) },
    { name: 'Certified', value: Number.parseInt(data.certified_enrollees) },
  ];

  const completionRangeData = data.enrollmentProgressData?.completionRanges
    ? data.enrollmentProgressData.completionRanges.map(item => ({
        name: item.range,
        value: Number.parseInt(item.count),
      }))
    : [];

  const enrollmentCompletionData = data.enrollment_completion_graph
    ? data.enrollment_completion_graph.map(item => ({
        date: new Date(item.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        count: Number.parseInt(item.count),
      }))
    : [];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Enrollment Status</CardTitle>
            <CardDescription>
              Distribution of active, inactive, and certified enrollees
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Enrollees">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Enrollment Completion Progress</CardTitle>
            <CardDescription>
              Average completion: {data.enrollmentProgressData.averageCompletion}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <Progress
                value={Number(data.enrollmentProgressData.averageCompletion)}
                className="h-2"
              />

              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={completionRangeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={value => formatNumber(value)} />
                  <Legend />
                  <Bar dataKey="value" name="Enrollees">
                    {completionRangeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={colors.completion[entry.name]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enrollment Completion Trend</CardTitle>
          <CardDescription>
            Daily enrollment completion counts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={enrollmentCompletionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={value => formatNumber(value)} />
              <Legend />
              <Area
                type="monotone"
                dataKey="count"
                name="Completions"
                stroke={colors.success}
                fill={colors.success}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}; 