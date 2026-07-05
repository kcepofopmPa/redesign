// Избранное. Ключ localStorage 'encar_favs' и схема Record<id, EncarCar> —
// ИЗ LEGACY, НЕ МЕНЯТЬ: избранное пользователей подхватывается без миграции.

import { useCallback, useState } from 'react';
import type { EncarCar, Favorites } from '../lib/types';

const LS_KEY = 'encar_favs';

function readFavs(): Favorites {
  try {
    const s = localStorage.getItem(LS_KEY);
    if (s) return JSON.parse(s);
  } catch { /* повреждённый JSON — пустое избранное */ }
  return {};
}

export function useFavorites() {
  const [favs, setFavs] = useState<Favorites>(readFavs);

  const toggle = useCallback((car: EncarCar): boolean => {
    let added = false;
    setFavs(prev => {
      const next = { ...prev };
      if (next[car.id]) {
        delete next[car.id];
      } else {
        next[car.id] = car;
        added = true;
      }
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      return next;
    });
    return added;
  }, []);

  const clear = useCallback(() => {
    setFavs({});
    localStorage.setItem(LS_KEY, JSON.stringify({}));
  }, []);

  const isSaved = useCallback((id: string) => Boolean(favs[id]), [favs]);

  return {
    favs,
    favList: Object.values(favs),
    count: Object.keys(favs).length,
    toggle,
    clear,
    isSaved,
  };
}
