export interface ThinkificWebhookEvent {
  id: string;
  type: 'enrollment.created' | 'enrollment.progress' | 'enrollment.completed';
  created_at: string;
  data: {
    id: string;
    user_id: string;
    course_id: string;
    activated_at?: string;
    completed_at?: string;
    percentage_completed?: number;
    started_at?: string;
    expiry_date?: string;
    is_free_trial?: boolean;
    completed?: boolean;
    expired?: boolean;
  };
}

export interface EnrollmentJobData {
  eventId: string;
  eventType: string;
  enrollmentData: ThinkificWebhookEvent['data'];
  processedAt?: string;
  retryCount?: number;
}

export interface EnrollmentSyncMetrics {
  totalProcessed: number;
  successful: number;
  failed: number;
  retries: number;
  averageLatency: number;
  queueSize: number;
  dlqSize: number;
  lastProcessedAt: string;
}

export interface EnrollmentUpdateData {
  id?: string;
  user_id?: string;
  course_id: string;
  activated_at?: Date;
  completed_at?: Date;
  percentage_completed?: number;
  started_at?: Date;
  expiry_date?: Date;
  is_free_trial?: boolean;
  completed?: boolean;
  expired?: boolean;
  enrolled?: boolean;
  updated_at?: Date;
}

export interface ThinkificApiResponse {
  id: string;
  user_id: string;
  course_id: string;
  activated_at: string;
  completed_at?: string;
  percentage_completed?: number;
  started_at?: string;
  expiry_date?: string;
  is_free_trial?: boolean;
  completed?: boolean;
  expired?: boolean;
}

export interface SyncCursor {
  lastProcessedAt: string;
  lastEnrollmentId?: string;
  totalProcessed: number;
}

