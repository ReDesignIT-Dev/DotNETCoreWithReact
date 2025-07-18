import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';

interface QueryParams {
  [key: string]: string;
}

export default function useQueryParams(): QueryParams {
  const [searchParams] = useSearchParams();

  const params = useMemo(() => {
    const queryParams: QueryParams = {};
    for (const [key, value] of searchParams.entries()) {
      queryParams[key] = value;
    }
    return queryParams;
  }, [searchParams]);

  return params;
}
