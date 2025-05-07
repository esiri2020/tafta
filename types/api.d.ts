import { UseQueryHookResult } from '@reduxjs/toolkit/dist/query/react/buildHooks';

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
  courseEnrollmentData: Array<{
    name: string;
    count: string;
  }>;
  total_enrolled_by_courses: number;
  total_enrolled_applicants: number;
  female_enrollments: number;
  male_enrollments: number;
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

// Remove duplicate hook declarations since they're implemented in services/api.ts 