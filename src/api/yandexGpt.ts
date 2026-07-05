// ═══════════════════════════════════════════════════════════════
// YandexGPT: NL-парсинг поискового запроса и AI-анализ лота.
// Портировано из legacy/index.html (parseNL / aiOne).
//
// ⚠️ КРИТИЧЕСКОЕ ЗНАНИЕ: сначала r.text(), потом JSON.parse —
//    API иногда возвращает HTML вместо JSON.
// ═══════════════════════════════════════════════════════════════

import type { AppConfig, EncarCar, SearchParams } from '../lib/types';

export const YANDEX_URL = 'https://llm.api.cloud.yandex.net/foundationModels/v1/completion';

interface YandexResponse {
  result: { alternatives: { message: { text: string } }[] };
}

async function callYandex(cfg: AppConfig, body: object): Promise<string> {
  const r = await fetch(YANDEX_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Api-Key ${cfg.key}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(body),
  });
  const rawText = await r.text();
  if (!r.ok) throw new Error(`YandexGPT ${r.status}: ${rawText.slice(0, 100)}`);
  let d: YandexResponse;
  try { d = JSON.parse(rawText); }
  catch { throw new Error(`Ответ не JSON: ${rawText.slice(0, 120)}`); }
  return d.result.alternatives[0].message.text.trim();
}

/** Естественный язык → SearchParams. Промпт из legacy — проверен, не менять без нужды. */
export async function parseNL(cfg: AppConfig, q: string): Promise<SearchParams> {
  const prompt = `Распарси запрос на поиск автомобиля. Верни ТОЛЬКО JSON без пояснений и markdown.
Запрос: "${q}"

Верни JSON (только нужные поля):
{
  "car_type": "korean" если корейский бренд (Hyundai/Kia/Genesis), иначе "foreign",
  "manufacturer": один из [hyundai, kia, genesis, ssangyong, bmw, mercedes, audi, lexus, toyota, porsche, volvo],
  "model_group": ModelGroup из Encar — ТОЧНОЕ имя: EV6, EV9, GV60, GV70, GV80, G70, G80, G90, K5, K8, 싼타페, 팰리세이드, 투싼, 쏘나타, 그랜저, 스포티지, 쏘렌토, 카니발, 니로, 아이오닉 5, 아이오닉 6, 코나, 스타리아, 토레스, 렉스턴, 티볼리,
  "year_from": YYYY,
  "year_to": YYYY,
  "mileage_max": число км (например 35000),
  "price_max_manwon": цена в 만원 = price_USD * 1340 / 10000,
  "price_min_manwon": число,
  "fuel": "가솔린" бензин | "디젤" дизель | "전기" электро | "가솔린+전기" гибрид
}
Только JSON, без текста.`;

  const txt = await callYandex(cfg, {
    modelUri: `gpt://${cfg.folder}/yandexgpt-lite`,
    completionOptions: { temperature: 0.1, maxTokens: 250 },
    messages: [{ role: 'user', text: prompt }],
  });

  const m = txt.match(/\{[\s\S]*\}/);
  if (!m) throw new Error('JSON не найден в ответе: ' + txt.slice(0, 100));
  return JSON.parse(m[0]) as SearchParams;
}

/** AI-оценка одного лота для импорта в РФ. Возвращает текст анализа. */
export async function analyzeCar(cfg: AppConfig, c: EncarCar): Promise<string> {
  if (!cfg.key || !cfg.folder) throw new Error('NO_KEYS');

  const pr = `Оцени лот для импорта в РФ:
${c.manufacturer} ${c.model} ${c.badge}
Год: ${c.year}.${c.month} | Пробег: ${c.mileage_km.toLocaleString()} км
Топливо: ${c.fuel_ru} | Цена: $${c.usd.toLocaleString()}
1-2 предложения с эмодзи: цена выгодная/норма/дорого? Стоит везти в РФ?`;

  return callYandex(cfg, {
    modelUri: `gpt://${cfg.folder}/yandexgpt-lite`,
    completionOptions: { temperature: 0.3, maxTokens: 150 },
    messages: [
      { role: 'system', text: 'Ты эксперт по параллельному импорту авто из Кореи в Россию. Коротко, с эмодзи.' },
      { role: 'user', text: pr },
    ],
  });
}
