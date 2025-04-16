import {EnrollmentCompletionGraph} from '@prisma/client';

export interface DashboardData {
  total_enrolled_by_courses: number;
  total_enrolled_applicants: number;
  female_enrollments: number;
  male_enrollments: number;
  active_enrollees: number;
  certified_enrollees: number;
  total_applicants: number;
  enrollment_completion_graph: EnrollmentCompletionGraph[];
  inactive_enrollments: number;
  age_group: EnrollmentCompletionGraph[];
  location: string; // The location of the enrollees (city, region, etc.)
  courses_by_location: Record<string, number>; // A mapping of courses to the number of enrollees in each course at the given location
  statusOfResidency: {
    refugee: number; // Number of refugee enrollees
    migrant_workers: number; // Number of migrant worker enrollees
    idp: number; // Number of internally displaced person (IDP) enrollees
    resident: number; // Number of resident enrollees
    non_resident: number; // Number of non-resident enrollees
  };
}
