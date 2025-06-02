import { UseQueryHookResult } from '@reduxjs/toolkit/dist/query/react/buildHooks';

export interface CourseEnrollment {
  name: string;
  count: string;
  male_count?: string;
  female_count?: string;
}

export interface DashboardData {
  enrollment_completion_graph: {
    id: string;
    date: Date | null;
    count: string;
  }[];
  active_enrollees: string;
  inactive_enrollments: string;
  certified_enrollees: string;
  total_applicants: string;
  total_enrolled: string;
  male_enrollees: string;
  female_enrollees: string;
  courseEnrollmentData: CourseEnrollment[];
  age_range: Array<{
    ageRange: string;
    count: string;
  }>;
  location: Array<{
    location: string;
    count: string;
  }>;
  statusOfResidency: {
    refugee: string;
    migrant_workers: string;
    idp: string;
    resident: string;
  };
  educationLevelData: Array<{
    level: string;
    count: string;
  }>;
  communityAreaData: {
    urban: string;
    rural: string;
    periUrban: string;
  };
  registrationTypeData: {
    individual: string;
    enterprise: string;
  };
  businessTypeData: Array<{
    type: string;
    count: string;
  }>;
  businessSizeData: Array<{
    size: string;
    count: string;
  }>;
  employmentStatusData: Array<{
    status: string;
    count: string;
  }>;
  internshipProgramData: Array<{
    program: string;
    count: string;
  }>;
  projectTypeData: Array<{
    type: string;
    count: string;
  }>;
  enrollmentProgressData: {
    averageCompletion: string;
    completionRanges: Array<{
      range: string;
      count: string;
    }>;
  };
  location_trends: Array<{
    month: string;
    [key: string]: string | number;
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
} 
