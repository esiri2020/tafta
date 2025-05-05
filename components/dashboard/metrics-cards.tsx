import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Grid } from '@mui/material';

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
  return Number(num).toLocaleString();
};

export const MetricsCards: React.FC<MetricsCardsProps> = ({ data }) => {
  const metrics = [
    {
      title: 'Total Applicants',
      value: formatNumber(data.total_applicants),
      description: 'Total number of applicants',
    },
    {
      title: 'Total Enrolled',
      value: formatNumber(data.total_enrolled_applicants),
      description: 'Total number of enrolled applicants',
    },
    {
      title: 'Active Enrollees',
      value: formatNumber(data.active_enrollees),
      description: 'Currently active students',
    },
    {
      title: 'Certified Enrollees',
      value: formatNumber(data.certified_enrollees),
      description: 'Students who completed certification',
    },
    {
      title: 'Male Enrollments',
      value: formatNumber(data.male_enrollments),
      description: 'Total male enrollments',
    },
    {
      title: 'Female Enrollments',
      value: formatNumber(data.female_enrollments),
      description: 'Total female enrollments',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}; 