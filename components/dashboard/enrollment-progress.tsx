'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Progress} from '@/components/ui/progress';

interface EnrollmentProgressProps {
  total: number;
  active: number;
  certified: number;
}

export function EnrollmentProgress({
  total,
  active,
  certified,
}: EnrollmentProgressProps) {
  const activePercentage = Math.round((active / total) * 100);
  const certifiedPercentage = Math.round((certified / total) * 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrollment Progress</CardTitle>
        <CardDescription>
          Tracking active and certified enrollees
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-2'>
          <div className='flex items-center justify-between text-sm'>
            <span>Active Enrollees</span>
            <span className='font-medium'>{activePercentage}%</span>
          </div>
          <Progress value={activePercentage} className='h-2 bg-slate-200' />
        </div>

        <div className='space-y-2'>
          <div className='flex items-center justify-between text-sm'>
            <span>Certified Enrollees</span>
            <span className='font-medium'>{certifiedPercentage}%</span>
          </div>
          <Progress value={certifiedPercentage} className='h-2 bg-slate-200' />
        </div>

        <div className='pt-2 text-xs text-muted-foreground'>
          <p>Total of {total.toLocaleString()} enrolled applicants</p>
          <p>
            {active.toLocaleString()} active and {certified.toLocaleString()}{' '}
            certified
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
