import { useCallback, useEffect, useRef, useState } from "react";

/** Minimal data hook: loading/error state, refetch for pull-to-refresh, and stale-response protection. */
export function useFetch<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const seq = useRef(0);

  const run = useCallback(async (isRefresh = false) => {
    const id = ++seq.current;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const result = await fn();
      if (id === seq.current) {
        setData(result);
        setError(null);
      }
    } catch (e) {
      if (id === seq.current) setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      if (id === seq.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { data, error, loading, refreshing, refetch: () => run(true), setData };
}
