import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

interface CohortCompletionRateProps {
  data: {
    states: StateCompletion[];
    totalCompletion: number;
    cohortName: string;
    date: string;
  };
}

export function CohortCompletionRate({ data }: CohortCompletionRateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{data.cohortName} LMS Completion Rate ({data.date})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {data.states.map((state) => (
            <div key={state.state} className="space-y-4">
              <h3 className="text-lg font-semibold">{state.state}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead className="text-right">Female</TableHead>
                    <TableHead className="text-right">Male</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {state.courses.map((course) => (
                    <TableRow key={course.course}>
                      <TableCell>{course.course}</TableCell>
                      <TableCell className="text-right">{course.female}</TableCell>
                      <TableCell className="text-right">{course.male}</TableCell>
                      <TableCell className="text-right">{course.total}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold">
                    <TableCell>Total Completion in {state.state}</TableCell>
                    <TableCell className="text-right">
                      {state.courses.reduce((sum, course) => sum + course.female, 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {state.courses.reduce((sum, course) => sum + course.male, 0)}
                    </TableCell>
                    <TableCell className="text-right">{state.total}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ))}
          <div className="text-right font-bold text-lg">
            Total LMS completed: {data.totalCompletion}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 