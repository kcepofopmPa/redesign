// Состояние поиска: запуск (структурный / AI), результаты, сортировка,
// динамический badge-фильтр по выдаче, статусы загрузки и CORS.
// Логика сортировки и badge-фильтра портирована из legacy (doSort/filterBadge/buildBadgeFilter).

import { useCallback, useMemo, useState } from 'react';
import { CorsError, searchCars } from '../api/encar';
import { parseNL } from '../api/yandexGpt';
import type { AppConfig, EncarCar, SearchParams, SortKey } from '../lib/types';

export type SearchStatus = 'idle' | 'loading' | 'done' | 'cors' | 'error';

export function useSearch() {
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [progress, setProgress] = useState('');
  const [results, setResults] = useState<EncarCar[]>([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [lastParams, setLastParams] = useState<SearchParams | null>(null);
  /** Параметры, распознанные AI, — для тегов подтверждения перед запуском (showParsed) */
  const [parsedPreview, setParsedPreview] = useState<SearchParams | null>(null);
  const [sort, setSort] = useState<SortKey>('price_asc');
  const [badgeFilter, setBadgeFilter] = useState('');

  const run = useCallback(async (p: SearchParams) => {
    setStatus('loading');
    setProgress('Подключаемся к Encar...');
    setError('');
    setBadgeFilter('');
    setLastParams(p);
    try {
      const { cars, total } = await searchCars(p, setProgress);
      setResults(cars);
      setTotal(total);
      setStatus('done');
    } catch (e) {
      setResults([]);
      if (e instanceof CorsError) {
        setStatus('cors');
      } else {
        setStatus('error');
        setError(e instanceof Error ? e.message : String(e));
      }
    }
  }, []);

  /** AI-режим: NL-запрос → parseNL → preview. Запуск поиска — отдельным подтверждением. */
  const parseQuery = useCallback(async (cfg: AppConfig, query: string) => {
    const params = await parseNL(cfg, query);
    setParsedPreview(params);
    return params;
  }, []);

  /** Динамический список badge из текущей выдачи (buildBadgeFilter) */
  const availableBadges = useMemo(() => {
    const counts = new Map<string, number>();
    results.forEach(c => {
      const b = c.badge.trim();
      if (b) counts.set(b, (counts.get(b) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [results]);

  /** Выдача после клиентского badge-фильтра и сортировки */
  const visible = useMemo(() => {
    let cars = badgeFilter
      ? results.filter(c => c.badge === badgeFilter)
      : results;
    const sorted = [...cars];
    switch (sort) {
      case 'price_asc': sorted.sort((a, b) => a.pmw - b.pmw); break;
      case 'price_desc': sorted.sort((a, b) => b.pmw - a.pmw); break;
      case 'year_desc': sorted.sort((a, b) => Number(b.year + b.month) - Number(a.year + a.month)); break;
      case 'mileage_asc': sorted.sort((a, b) => a.mileage_km - b.mileage_km); break;
    }
    return sorted;
  }, [results, badgeFilter, sort]);

  return {
    status, progress, error,
    results, visible, total,
    lastParams, parsedPreview, setParsedPreview,
    sort, setSort,
    badgeFilter, setBadgeFilter, availableBadges,
    run, parseQuery,
  };
}
