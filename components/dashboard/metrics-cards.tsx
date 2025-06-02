import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX, Award, UserPlus, UserMinus } from 'lucide-react';

interface MetricsCardsProps {
  data: {
    total_enrolled_by_courses: number;
    total_enrolled_applicants: number;
    female_enrollments: number;
    male_enrollments: number;
    active_enrollees: number;
    certified_enrollees: number;
    total_applicants: number;
    inactive_enrollments: number;
  };
}

const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

export const MetricsCards: React.FC<MetricsCardsProps> = ({ data }) => {
  // Memoize metrics data transformation
  const metrics = useMemo(() => [
    {
      title: 'Total Applicants',
      value: formatNumber(data.total_applicants),
      description: 'Total number of applicants',
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: 'Total Enrolled',
      value: formatNumber(data.total_enrolled_applicants),
      description: 'Total number of enrolled applicants',
      icon: UserPlus,
      color: 'text-green-500',
    },
    {
      title: 'Active Enrollees',
      value: formatNumber(data.active_enrollees),
      description: 'Currently active students',
      icon: UserCheck,
      color: 'text-emerald-500',
    },
    {
      title: 'Certified Enrollees',
      value: formatNumber(data.certified_enrollees),
      description: 'Students who completed certification',
      icon: Award,
      color: 'text-purple-500',
    },
    {
      title: 'Male Enrollments',
      value: formatNumber(data.male_enrollments),
      description: 'Total male enrollments',
      icon: UserPlus,
      color: 'text-blue-500',
    },
    {
      title: 'Female Enrollments',
      value: formatNumber(data.female_enrollments),
      description: 'Total female enrollments',
      icon: UserPlus,
      color: 'text-pink-500',
    },
  ], [data]);

  // Memoize the card component to prevent unnecessary re-renders
  const MetricCard = useMemo(() => {
    return ({ metric }: { metric: typeof metrics[0] }) => {
      const Icon = metric.icon;
      return (
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <Icon className={`h-4 w-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metric.description}
            </p>
          </CardContent>
        </Card>
      );
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>
    </div>
  );
}; 