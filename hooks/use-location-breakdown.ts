import { useQuery } from '@tanstack/react-query';

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

interface LocationBreakdownData {
  states: LocationData[];
  totalCompletion: number;
  cohortName: string;
  date: string;
}

export function useLocationBreakdown(cohortId: string) {
  return useQuery<LocationBreakdownData>({
    queryKey: ['locationBreakdown', cohortId],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/location-breakdown?cohortId=${cohortId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch location breakdown data');
      }
      return response.json();
    },
    enabled: !!cohortId,
  });
} 