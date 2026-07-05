// Адаптер: EncarCar (домен) → Car (UI-тип макета Kinetic Gallery).
// Позволяет подключить реальные данные к существующим CarCard/вью
// без их переписывания. По мере доработки вью под EncarCar (Фаза 3)
// адаптер можно будет удалить.

import type { Car, EncarCar } from './types';

/** Формат цены: манвоны → USD для отображения в UI макета */
export function encarToCard(c: EncarCar): Car {
  const tags: string[] = [];
  if (c.fuel_ru === 'Электро') tags.push('Электро');
  if (c.fuel_ru === 'Гибрид') tags.push('Гибрид');
  const curYear = new Date().getFullYear();
  if (Number(c.year) >= curYear - 1) tags.push('Свежий год');

  return {
    id: c.id,
    make: c.manufacturer,
    model: `${c.model} ${c.badge}`.trim(),
    year: Number(c.year) || 0,
    price: c.usd,
    image: c.thumbnail,
    specs: {
      miles: `${c.mileage_km.toLocaleString()} км`,
      engine: [c.fuel_ru, c.displacement].filter(Boolean).join(' '),
      transmission: c.gearbox,
      drive: c.drive,
    },
    tags,
  };
}
