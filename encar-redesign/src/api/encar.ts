// ═══════════════════════════════════════════════════════════════
// Encar API: построение nested-query, загрузка, оркестрация.
// Портировано 1:1 из legacy/index.html (buildQuery/fetchPage/
// doSearch/getCarType). БЕЗ DOM — чистые функции.
//
// ⚠️ КРИТИЧЕСКОЕ ЗНАНИЕ: API принимает только nested-структуру
//    C.CarType.Y._.(C.Manufacturer.기아._.ModelGroup.EV6.)
//    Плоские запросы возвращают ~0 результатов.
// ═══════════════════════════════════════════════════════════════

import { MAKERS_KR } from '../data/makers';
import { parseCar } from './encarParser';
import type { EncarApiResponse, EncarCar, SearchParams } from '../lib/types';

export const ENCAR_URL = 'https://api.encar.com/search/car/list/general';

const PAGE = 50;  // авто за один запрос
const MAX = 200;  // максимум авто на клиенте

/** 'Y' — корейские марки, 'N' — иностранные */
export function getCarType(manufacturer: string): 'Y' | 'N' {
  const korean = ['hyundai', 'kia', 'genesis', 'ssangyong'];
  if (!manufacturer) return 'N';
  return korean.includes(manufacturer) ? 'Y' : 'N';
}

/**
 * Nested-query для Encar API.
 * Формат строки должен побайтово совпадать с legacy — см. тест buildQuery.test.ts.
 */
export function buildQuery(p: SearchParams): string {
  const ct = p.car_type
    ? (p.car_type === 'foreign' ? 'N' : 'Y')
    : getCarType(p.manufacturer || '');

  const yf = p.year_from || 2015;
  const yt = p.year_to || 2026;
  const mil = p.mileage_max || 300000;
  const pMn = p.price_min_manwon || 100;
  const pMx = p.price_max_manwon || 99000;

  // Базовые фильтры (не зависят от марки/модели)
  const base = [
    `And.Year.range(${yf}01..${yt}12).`,
    `_.Mileage.range(0..${mil}).`,
    `_.Price.range(${pMn}..${pMx}).`,
    `_.Hidden.N.`,
  ];

  // BadgeGroup filter (топливо + привод, из Encar iNav)
  if (p.badgeGroups && p.badgeGroups.length === 1) {
    base.push(`_.BadgeGroup.${p.badgeGroups[0]}.`);
  }

  const makerKr = p.manufacturer ? MAKERS_KR[p.manufacturer] : null;
  const mg = p.model_group; // ModelGroup из Encar (싼타페, EV6 и тд)

  if (makerKr && mg) {
    // Точный поиск: вложенный C. с ModelGroup — как на сайте Encar
    base.push(`_.(C.CarType.${ct}._.(C.Manufacturer.${makerKr}._.ModelGroup.${mg}.))`);
  } else if (makerKr) {
    // Только марка — плоская структура
    base.push(`_.CarType.${ct}.`);
    base.push(`_.Manufacturer.${makerKr}.`);
  } else {
    base.push(`_.CarType.${ct}.`);
  }

  return '(' + base.join('') + ')';
}

/** Одна страница результатов */
export async function fetchPage(q: string, offset: number, count: number): Promise<EncarApiResponse> {
  const sr = `|ModifiedDate|${offset}|${count}`;
  const url = `${ENCAR_URL}?count=true&q=${encodeURIComponent(q)}&sr=${encodeURIComponent(sr)}`;
  const r = await fetch(url, {
    headers: {
      // Примечание: браузер может игнорировать часть заголовков (Referer/User-Agent
      // из fetch не устанавливаются) — оставлено как в legacy, вреда нет.
      'Accept': 'application/json',
    },
  });
  if (!r.ok) throw new Error(`Encar API ${r.status}`);
  return r.json();
}

export interface SearchResult {
  cars: EncarCar[];
  total: number;
}

export class CorsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CorsError';
  }
}

/**
 * Полный цикл поиска: запрос → догрузка страниц → парсинг →
 * клиентские фильтры → дедупликация. UI-логика (лоадеры, corsWarn)
 * живёт в useSearch — здесь только данные.
 */
export async function searchCars(
  p: SearchParams,
  onProgress?: (msg: string) => void,
): Promise<SearchResult> {
  try {
    const q = buildQuery(p);
    onProgress?.('Загружаем результаты...');

    // Первый запрос — узнаём общее количество
    const first = await fetchPage(q, 0, PAGE);
    const total = first.Count || 0;
    let allRaw = first.SearchResults || [];

    onProgress?.(`Найдено ${total.toLocaleString()} авто, загружаем...`);

    // Если результатов больше PAGE — догружаем страницами параллельно
    if (total > PAGE && allRaw.length < MAX) {
      const pages = Math.min(Math.ceil(total / PAGE), Math.ceil(MAX / PAGE));
      const fetches = [];
      for (let i = 1; i < pages; i++) {
        fetches.push(fetchPage(q, i * PAGE, PAGE));
      }
      const results = await Promise.all(fetches);
      results.forEach(r => { allRaw = allRaw.concat(r.SearchResults || []); });
    }

    allRaw = allRaw.slice(0, MAX);

    let cars = allRaw.map(parseCar);

    // Клиентский фильтр по топливу
    if (p.fuel) cars = cars.filter(c => c.fuel === p.fuel);
    // Клиентский фильтр по приводу
    if (p.drive) cars = cars.filter(c => c.drive === p.drive);
    // Клиентский фильтр по комплектации (Badge)
    if (p.badge) {
      const bl = p.badge.toLowerCase();
      cars = cars.filter(c =>
        c.badge.toLowerCase().includes(bl) ||
        c.badgeDetail.toLowerCase().includes(bl)
      );
    }

    // Дедупликация
    const seen = new Set<string>();
    cars = cars.filter(c => {
      const k = `${c.id}_${c.model}_${c.badge}_${c.mileage_km}_${c.pmw}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    return { cars, total };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('CORS')) {
      throw new CorsError(msg);
    }
    throw e;
  }
}
