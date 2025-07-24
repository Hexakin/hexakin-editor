import { useState } from "react";

// T is the expected type of the successful data result
export function useApiMutation<T>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const mutate = async (url: string, body: object) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'An API error occurred.');
      }
      
      setData(result);
      return result as T;
    } catch (err: any) {
      setError(err.message);
      // Ensure data is cleared on error
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error, data };
}