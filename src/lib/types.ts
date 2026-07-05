// ═══════════════════════════════════════════════════════════════
// Доменные типы Encar Search. Портировано из legacy/index.html.
// ═══════════════════════════════════════════════════════════════

/** Машина после parseCar() — единица данных всего приложения */
export interface EncarCar {
  id: string;
  /** Ссылка на карточку encar.com */
  url: string;
  manufacturer: string;
  model: string;
  badge: string;
  badgeDetail: string;
  displacement: string; // '1999cc' | ''
  gearbox: string;
  drive: 'AWD' | 'FWD' | 'RWD' | '';
  year: string;  // 'YYYY'
  month: string; // 'MM'
  mileage_km: number;
  fuel: string;    // корейское имя из API: 가솔린/디젤/전기/가솔린+전기/LPG
  fuel_ru: string; // русская локализация
  region: string;
  /** Цена в манвонах (만원) — нативная единица Encar */
  pmw: number;
  usd: number;
  rub: number;
  photos: string[]; // 8 кандидатов _001.._008
  thumbnail: string;
  ai: string; // текст AI-анализа (aiOne)
}

/** Параметры поиска — вход buildQuery/doSearch */
export interface SearchParams {
  car_type?: 'korean' | 'foreign';
  manufacturer?: string;      // ключ MAKERS_KR ('kia', 'bmw', ...)
  model_group?: string;       // ТОЧНОЕ имя ModelGroup из MODELGROUPS[maker][i][1]
  year_from?: number;
  year_to?: number;
  mileage_max?: number;
  price_min_manwon?: number;
  price_max_manwon?: number;
  /** Клиентские фильтры (после загрузки) */
  fuel?: string;
  drive?: string;
  badge?: string;
  /** Серверный BadgeGroup-фильтр (ровно один — ограничение nested-query) */
  badgeGroups?: string[];
}

/** Ответ Encar API */
export interface EncarApiResponse {
  Count: number;
  SearchResults: EncarRawCar[];
}

/** Сырой объект машины из API (поля, которые реально используются) */
export interface EncarRawCar {
  Id?: number | string;
  Manufacturer?: string;
  Model?: string;
  Badge?: string;
  BadgeDetail?: string;
  Gearbox?: string;
  Displacement?: number;
  Year?: number | string; // YYYYMM
  Mileage?: number | string;
  FuelType?: string;
  OfficeCityState?: string;
  Price?: number; // манвоны
  Photo?: string;
  photo?: string;
}

/** Настройки приложения — localStorage['encar_cfg'] (ключ и схема из legacy, НЕ МЕНЯТЬ) */
export interface AppConfig {
  key: string;    // YandexGPT API key
  folder: string; // Yandex Cloud folder ID
  count: number;  // карточек на страницу
  usd: number;    // курс USD→RUB (для отображения)
  krw: number;    // курс KRW→RUB
}

export const DEFAULT_CONFIG: AppConfig = {
  key: '',
  folder: '',
  count: 30,
  usd: 90,
  krw: 0.0675,
};

/** Избранное — localStorage['encar_favs'] (ключ и схема из legacy, НЕ МЕНЯТЬ) */
export type Favorites = Record<string, EncarCar>;

export type SortKey = 'price_asc' | 'price_desc' | 'year_desc' | 'mileage_asc';

export const FUEL_RU: Record<string, string> = {
  '가솔린': 'Бензин',
  '디젤': 'Дизель',
  '전기': 'Электро',
  '가솔린+전기': 'Гибрид',
  'LPG': 'LPG',
};

// ── Тип UI-карточки макета (Kinetic Gallery) ──
// Оставлен для совместимости с существующими вью; связывается через lib/adapter.ts
export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  image: string;
  specs: {
    acceleration?: string;
    power?: string;
    range?: string;
    engine?: string;
    transmission?: string;
    drive?: string;
    miles?: string;
  };
  tags: string[];
  featured?: boolean;
}

export interface FilterState {
  manufacturer: string[];
  priceRange: [number, number];
  fuelType: string[];
}

export type View = 'inventory' | 'saved' | 'settings' | 'filters' | 'details';
