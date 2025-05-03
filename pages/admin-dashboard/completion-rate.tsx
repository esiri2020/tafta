import { useRouter } from 'next/router';
import { useCompletionRate } from '@/hooks/use-completion-rate';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface CourseCompletion {
  course: string;
  female: number;
  male: number;
  total: number;
}

interface StateCompletion {
  state: string;
  courses: CourseCompletion[];
  total: number;
}

interface CompletionRateData {
  states: StateCompletion[];
  totalCompletion: number;
  cohortName: string;
  date: string;
}

export default function CompletionRatePage() {
  const router = useRouter();
  const { cohortId } = router.query;
  const { data, isLoading, error } = useCompletionRate(cohortId as string);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-[100px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load completion rate data. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{data.cohortName} Completion Rate</h1>
        <p className="text-sm text-muted-foreground">As of {data.date}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.states.map((state: StateCompletion) => (
          <Card key={state.state}>
            <CardHeader>
              <CardTitle>{state.state}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Total Completions:</div>
                  <div className="font-medium">{state.total}</div>
                </div>
                <div className="space-y-2">
                  {state.courses.map((course: CourseCompletion) => (
                    <div key={course.course} className="rounded-lg border p-2">
                      <div className="font-medium">{course.course}</div>
                      <div className="mt-1 grid grid-cols-2 gap-1 text-sm">
                        <div>Female:</div>
                        <div>{course.female}</div>
                        <div>Male:</div>
                        <div>{course.male}</div>
                        <div>Total:</div>
                        <div className="font-medium">{course.total}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Total Completions: {data.totalCompletion}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
} 