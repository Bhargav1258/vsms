import { useState, useEffect, useCallback } from 'react';
import { ApiResponse } from '../services/api';

// Generic hook for API calls with loading and error states
export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall();
      
      if (response.success && response.data) {
        setData(response.data);
      } else {
        setError(response.error || 'An error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    execute();
  }, [execute]);

  const refetch = useCallback(() => {
    execute();
  }, [execute]);

  return { data, loading, error, refetch };
}

// Hook for mutations (POST, PUT, DELETE operations)
export function useMutation<T, P = any>(
  apiCall: (params: P) => Promise<ApiResponse<T>>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (params: P): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(params);
      
      if (response.success && response.data) {
        setData(response.data);
        return true;
      } else {
        setError(response.error || 'An error occurred');
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, mutate, reset };
}

// Hook for paginated data
export function usePaginatedApi<T>(
  apiCall: (page: number, limit: number) => Promise<ApiResponse<{ data: T[]; total: number; page: number; limit: number; totalPages: number }>>,
  initialPage = 1,
  initialLimit = 10
) {
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (page: number, limit: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(page, limit);
      
      if (response.success && response.data) {
        setData(response.data.data);
        setPagination({
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
          totalPages: response.data.totalPages,
        });
      } else {
        setError(response.error || 'An error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchData(pagination.page, pagination.limit);
  }, [fetchData, pagination.page, pagination.limit]);

  const goToPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const changeLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  const refetch = useCallback(() => {
    fetchData(pagination.page, pagination.limit);
  }, [fetchData, pagination.page, pagination.limit]);

  return {
    data,
    pagination,
    loading,
    error,
    goToPage,
    changeLimit,
    refetch,
  };
}

// Hook for real-time data with polling
export function usePolling<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  interval: number = 30000, // 30 seconds default
  enabled: boolean = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await apiCall();
      
      if (response.success && response.data) {
        setData(response.data);
        setError(null);
      } else {
        setError(response.error || 'An error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    if (!enabled) return;

    fetchData(); // Initial fetch

    const intervalId = setInterval(fetchData, interval);

    return () => clearInterval(intervalId);
  }, [fetchData, interval, enabled]);

  return { data, loading, error, refetch: fetchData };
}