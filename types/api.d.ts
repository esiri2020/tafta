import { UseQueryHookResult } from '@reduxjs/toolkit/dist/query/react/buildHooks';

export interface CourseEnrollment {
  name: string;
  count: string;
}

export interface DashboardData {
  enrollment_completion_graph: {
    id: bigint;
    date: Date | null;
    count: bigint;
  }[];
  active_enrollees: number;
  inactive_enrollments: number;
  certified_enrollees: number;
  total_applicants: number;
  total_enrolled: number;
  male_enrollees: number;
  female_enrollees: number;
<<<<<<< HEAD
  courseEnrollmentData: Array<{
    name: string;
    count: string;
  }>;
  total_enrolled_by_courses: number;
  total_enrolled_applicants: number;
  female_enrollments: number;
  male_enrollments: number;
=======
  courseEnrollmentData: CourseEnrollment[];
>>>>>>> 31ff53017003a0538b28a39456a22b39183ff621
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

<<<<<<< HEAD
// Remove duplicate hook declarations since they're implemented in services/api.ts 
=======
declare module '@/services/api' {
  interface ApiResponse<T> {
    data: T;
  }
} 
>>>>>>> 31ff53017003a0538b28a39456a22b39183ff621
