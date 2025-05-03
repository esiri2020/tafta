import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface CourseStats {
  course: string;
  female: number;
  male: number;
  total: number;
}

interface LocationData {
  state: string;
  courses: CourseStats[];
  total: number;
}

interface LocationBreakdownProps {
  data: LocationData[];
  cohortName: string;
  date: string;
  totalCompletion: number;
}

export function LocationBreakdown({ data, cohortName, date, totalCompletion }: LocationBreakdownProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Certified Enrollees by Location</CardTitle>
        <CardDescription>
          {cohortName} - {date}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {data.map((location) => (
          <div key={location.state} className="mb-8">
            <h3 className="text-lg font-semibold mb-4">
              {location.state.toUpperCase()} - Total: {location.total}
            </h3>
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
                {location.courses.map((course) => (
                  <TableRow key={course.course}>
                    <TableCell className="font-medium">{course.course}</TableCell>
                    <TableCell className="text-right">{course.female}</TableCell>
                    <TableCell className="text-right">{course.male}</TableCell>
                    <TableCell className="text-right">{course.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ))}
        <div className="mt-4 text-right text-lg font-semibold">
          Total LMS Completed: {totalCompletion}
        </div>
      </CardContent>
    </Card>
  );
} 