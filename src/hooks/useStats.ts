import { useQuery } from '@tanstack/react-query';
import { apiService } from '../services/api';
import { queryKeys } from '../lib/query-client';

export function useStats() {
  const {
    data: stats,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.statsByPractitioner('current'),
    queryFn: apiService.getStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    stats,
    isLoading,
    error,
    refetch,
  };
}
