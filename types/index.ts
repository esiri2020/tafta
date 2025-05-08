<<<<<<< HEAD
import {EnrollmentCompletionGraph} from '@prisma/client';

// Remove duplicate DashboardData interface since we're using the one from api.d.ts
=======
export interface DashboardData {
  total_enrolled_by_courses: number;
  total_enrolled_applicants: number;
  female_enrollments: number;
  male_enrollments: number;
  active_enrollees: number;
  certified_enrollees: number;
  total_applicants: number;
  enrollment_completion_graph: Array<{
    id: bigint;
    date: Date | null;
    count: bigint;
  }>;
  inactive_enrollments: number;
  age_group: Array<{
    id: bigint;
    date: Date | null;
    count: bigint;
  }>;
  location: string; // The location of the enrollees (city, region, etc.)
  courses_by_location: Record<string, number>; // A mapping of courses to the number of enrollees in each course at the given location
  statusOfResidency: {
    refugee: number; // Number of refugee enrollees
    migrant_workers: number; // Number of migrant worker enrollees
    idp: number; // Number of internally displaced person (IDP) enrollees
    resident: number; // Number of resident enrollees
    non_resident: number; // Number of non-resident enrollees
  };
  courseEnrollmentData: Array<{
    name: string;
    count: string;
  }>;
}

export interface LocationData {
  states: Array<{
    state: string;
    courses: Array<{
      course: string;
      female: number;
      male: number;
      total: number;
    }>;
    total: number;
  }>;
  totalCompletion: number;
  cohortName: string;
  date: string;
}
>>>>>>> 31ff53017003a0538b28a39456a22b39183ff621
