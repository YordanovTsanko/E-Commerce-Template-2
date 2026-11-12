import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useDebounce } from './useDebounce';

/**
 * Общ hook за админ списъци: търсене с debounce, филтри и пагинация в URL.
 * queryKey: базов ключ (напр. ['admin', 'orders'])
 * fetcher: (params) => Promise<{ items, pagination }>
 */
export const useAdminList = ({ queryKey, fetcher, filterKeys = [], limit = 20 }) => {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') || '');
  const debouncedSearch = useDebounce(search, 400);

  const page = Number(params.get('page')) || 1;
  const filters = Object.fromEntries(filterKeys.map((key) => [key, params.get(key) || '']));
  const queryParams = { ...filters, search: debouncedSearch.trim(), page, limit };

  const setParam = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
    if (!('page' in changes)) next.delete('page');
    setParams(next, { replace: true });
  };

  const query = useQuery({
    queryKey: [...queryKey, queryParams],
    queryFn: () => fetcher(queryParams),
    placeholderData: keepPreviousData,
  });

  return {
    ...query,
    rows: query.data?.items || [],
    pagination: query.data?.pagination,
    search,
    setSearch: (value) => {
      setSearch(value);
      if (page !== 1) setParam({ page: '' });
    },
    filters,
    setFilter: (key, value) => setParam({ [key]: value }),
    setPage: (p) => setParam({ page: String(p) }),
  };
};
