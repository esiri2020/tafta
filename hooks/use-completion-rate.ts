import { useQuery } from '@tanstack/react-query';

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

interface CompletionRateData {
  states: StateCompletion[];
  totalCompletion: number;
  cohortName: string;
  date: string;
}

export function useCompletionRate(cohortId: string) {
  return useQuery<CompletionRateData>({
    queryKey: ['completionRate', cohortId],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/completion-rate?cohortId=${cohortId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch completion rate data');
      }
      return response.json();
    },
    enabled: !!cohortId,
  });
} 