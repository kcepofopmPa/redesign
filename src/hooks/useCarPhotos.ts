// Фото карточки: проверка доступности кандидатов _001.._008 с диагностикой.
// Фундамент Фазы 4 (баг «фото не грузятся»). Photo ID ≠ Car ID —
// используем ТОЛЬКО URL из parseCar (поле Photo API), без фолбэков по ID.

import { useCallback, useEffect, useRef, useState } from 'react';

export interface PhotoState {
  /** Прошедшие проверку URL (onload успешен) */
  loaded: string[];
  /** Не загрузившиеся URL — для диагностики CORS/404 */
  failed: string[];
  checking: boolean;
}

/** Проверка одного URL через Image() — обходит CORS-ограничения fetch для <img> */
function probeImage(url: string, timeoutMs = 8000): Promise<boolean> {
  return new Promise(resolve => {
    const img = new Image();
    const timer = setTimeout(() => { img.src = ''; resolve(false); }, timeoutMs);
    img.onload = () => { clearTimeout(timer); resolve(true); };
    img.onerror = () => { clearTimeout(timer); resolve(false); };
    img.referrerPolicy = 'no-referrer'; // как в legacy meta referrer
    img.src = url;
  });
}

const cache = new Map<string, PhotoState>();

export function useCarPhotos(carId: string, candidates: string[], enabled: boolean) {
  const [state, setState] = useState<PhotoState>(() =>
    cache.get(carId) || { loaded: [], failed: [], checking: false }
  );
  const started = useRef(false);

  const check = useCallback(async () => {
    if (started.current || !candidates.length) return;
    started.current = true;
    setState(s => ({ ...s, checking: true }));

    const loaded: string[] = [];
    const failed: string[] = [];
    // Последовательно: первая неудача после ≥1 успеха — конец серии (фото идут подряд)
    for (const url of candidates) {
      const ok = await probeImage(url);
      if (ok) loaded.push(url);
      else {
        failed.push(url);
        if (loaded.length > 0) break; // серия закончилась
      }
    }

    if (failed.length && !loaded.length) {
      // Диагностика фото-бага: все кандидаты недоступны
      console.warn(`[photos] car ${carId}: 0/${candidates.length} loaded. First candidate:`, candidates[0]);
    }

    const next = { loaded, failed, checking: false };
    cache.set(carId, next);
    setState(next);
  }, [carId, candidates]);

  useEffect(() => {
    if (enabled) check();
  }, [enabled, check]);

  return state;
}
