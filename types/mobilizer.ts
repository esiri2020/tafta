export interface Mobilizer {
  id: string;
  code: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  organization?: string;
  status: MobilizerStatus;
  totalReferrals: number;
  activeReferrals: number;
  completedReferrals: number;
  createdAt: Date;
  updatedAt: Date;
  userId?: string;
}

export interface MobilizerReferral {
  id: string;
  fullName: string;
  email: string;
  courseName?: string;
  enrollmentStatus?: string;
  completionPercentage?: number;
  lastActivity?: Date;
  profile: {
    id: string;
    phoneNumber?: string;
    stateOfResidence?: string;
    employmentStatus?: string;
  };
  userCohort?: {
    id: string;
    cohort: {
      id: string;
      name: string;
      start_date: Date;
      end_date: Date;
    };
    enrollments: Array<{
      id: string;
      course_name: string;
      percentage_completed?: number;
      completed: boolean;
      started_at?: Date;
      completed_at?: Date;
    }>;
  }[];
}

export interface MobilizerStats {
  totalReferrals: number;
  activeReferrals: number;
  completedReferrals: number;
  completionRate: number;
  averageCompletionPercentage: number;
  referralsByCourse: Array<{
    courseName: string;
    count: number;
  }>;
  referralsByStatus: Array<{
    status: string;
    count: number;
  }>;
}

export interface CreateMobilizerRequest {
  code: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  organization?: string;
  password: string;
}

export interface UpdateMobilizerRequest {
  fullName?: string;
  phoneNumber?: string;
  organization?: string;
  status?: MobilizerStatus;
}

export type MobilizerStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

