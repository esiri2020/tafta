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

declare module '@/services/api' {
  interface ApiResponse<T> {
    data: T;
  }

  export function useGetDashboardDataQuery(
    params: { cohortId?: string },
    options?: any
  ): UseQueryHookResult<ApiResponse<DashboardData>>;

  export function useGetLocationBreakdownQuery(
    params: { cohortId?: string },
    options?: any
  ): UseQueryHookResult<ApiResponse<LocationData>>;
} 