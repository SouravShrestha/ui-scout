'use client';
import { useState } from 'react';
import type { AnalyzeResponse, AnalyzeError } from '../lib/types';

export function useAnalyze() {
  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function analyze(url: string) {
    setIsLoading(true);
    setError(null);
    setData(null);
    try {
      const res = await fetch(`/api/analyze?url=${encodeURIComponent(url)}`);
      const json = await res.json();
      if (!res.ok) {
        setError((json as AnalyzeError).error || 'Something went wrong');
      } else {
        setData(json as AnalyzeResponse);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Network error');
    } finally {
      setIsLoading(false);
    }
  }

  return { analyze, data, error, isLoading };
}
