// ═══════════════════════════════════════════════════════════════
// ТЕСТ ПАРИТЕТА: buildQuery должен побайтово совпадать с legacy.
// Эталонные строки сгенерированы прогоном оригинальной функции
// из legacy/index.html в Node (2026-07-05).
// Запуск: npx tsx src/api/buildQuery.parity.test.ts
//   (или временно: node --experimental-strip-types)
// При падении хотя бы одного кейса — НЕ мерджить: сломан nested-query.
// ═══════════════════════════════════════════════════════════════

import { buildQuery } from './encar';
import type { SearchParams } from '../lib/types';

const CASES: Array<[SearchParams, string]> = [
  [
    { manufacturer: 'kia', model_group: 'EV6', year_from: 2021, year_to: 2025, mileage_max: 60000, price_min_manwon: 1000, price_max_manwon: 5000 },
    '(And.Year.range(202101..202512)._.Mileage.range(0..60000)._.Price.range(1000..5000)._.Hidden.N._.(C.CarType.Y._.(C.Manufacturer.기아._.ModelGroup.EV6.)))',
  ],
  [
    { manufacturer: 'bmw', model_group: '5시리즈', badgeGroups: ['디젤 4WD'] },
    '(And.Year.range(201501..202612)._.Mileage.range(0..300000)._.Price.range(100..99000)._.Hidden.N._.BadgeGroup.디젤 4WD._.(C.CarType.N._.(C.Manufacturer.BMW._.ModelGroup.5시리즈.)))',
  ],
  [
    { manufacturer: 'hyundai' },
    '(And.Year.range(201501..202612)._.Mileage.range(0..300000)._.Price.range(100..99000)._.Hidden.N._.CarType.Y._.Manufacturer.현대.)',
  ],
  [
    {},
    '(And.Year.range(201501..202612)._.Mileage.range(0..300000)._.Price.range(100..99000)._.Hidden.N._.CarType.N.)',
  ],
  [
    { car_type: 'foreign', manufacturer: 'porsche', model_group: '파나메라', year_from: 2018 },
    '(And.Year.range(201801..202612)._.Mileage.range(0..300000)._.Price.range(100..99000)._.Hidden.N._.(C.CarType.N._.(C.Manufacturer.포르쉐._.ModelGroup.파나메라.)))',
  ],
];

let failed = 0;
CASES.forEach(([params, expected], i) => {
  const actual = buildQuery(params);
  if (actual === expected) {
    console.log(`✅ case ${i + 1}: OK`);
  } else {
    failed++;
    console.error(`❌ case ${i + 1}: MISMATCH`);
    console.error(`   expected: ${expected}`);
    console.error(`   actual:   ${actual}`);
  }
});

if (failed) {
  console.error(`\n${failed}/${CASES.length} кейсов упало — nested-query сломан, НЕ МЕРДЖИТЬ.`);
  process.exit(1);
}
console.log(`\nВсе ${CASES.length} кейсов совпали с legacy побайтово. Паритет подтверждён.`);
