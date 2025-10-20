import {useEffect, useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Skeleton} from '@/components/ui/skeleton';

interface CourseStats {
  Female: number;
  Male: number;
  Total: number;
}

interface StateStats {
  [course: string]: CourseStats;
}

interface Stats {
  [state: string]: StateStats;
}

interface Statistics {
  stats: Stats;
  stateTotals: Record<string, number>;
  grandTotal: number;
}

export function CourseCompletionStats() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch('/api/statistics/cached');
        if (!response.ok) {
          throw new Error('Failed to fetch statistics');
        }
        const data = await response.json();
        setStatistics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, []);

  if (loading) {
    return <Skeleton className='h-[400px] w-full' />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className='p-6'>
          <p className='text-red-500'>Error: {error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!statistics) {
    return null;
  }

  return (
    <div className='space-y-8'>
      {Object.entries(statistics.stats).map(([state, courses]) => (
        <div key={state} className='space-y-4'>
          <h2 className='text-2xl font-bold'>{state} STATE</h2>
          <div className='space-y-6'>
            {Object.entries(courses).map(([course, stats]) => (
              <div key={course} className='space-y-2'>
                <h3 className='font-semibold'>• {course}:</h3>
                <div className='grid grid-cols-3 gap-4 text-sm ml-4'>
                  <div>Female: {stats.Female.toString().padStart(4)}</div>
                  <div>Male: {stats.Male.toString().padStart(6)}</div>
                  <div>Total: {stats.Total.toString().padStart(6)}</div>
                </div>
              </div>
            ))}
            <div className='pt-4 border-t'>
              <p className='font-semibold'>
                Total Completion in {state}:{' '}
                {statistics.stateTotals[state].toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ))}
      <div className='pt-4 border-t-2'>
        <p className='text-xl font-semibold'>
          Total LMS completed: {statistics.grandTotal.toLocaleString()}
        </p>
      </div>
    </div>
  );
}
