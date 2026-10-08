'use client';

import { useState, useEffect, useCallback, DependencyList } from 'react';

interface UseApiDataResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useApiData<T>(
  fetcher: () => Promise<T>,
  deps: DependencyList = []
): UseApiDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const executeFetch = useCallback(async () => {
    let isCurrent = true;
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      if (isCurrent) {
        setData(result);
      }
    } catch (err: unknown) {
      if (isCurrent) {
        const errorObj = err instanceof Error ? err : new Error(String(err));
        setError(errorObj);
      }
    } finally {
      if (isCurrent) {
        setLoading(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    setError(null);

    fetcher()
      .then((res) => {
        if (!cancel) {
          setData(res);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancel) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setLoading(false);
        }
      });

    return () => {
      cancel = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error, refetch: executeFetch };
}
