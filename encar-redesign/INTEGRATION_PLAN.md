# План интеграции: Kinetic Gallery (дизайн) × Encar Search (функционал)

**Дата:** 2026-07-05 · **Статус:** Фазы 0–2 выполнены (Fable 5) · **Исполнение далее:** Claude Code (Фазы 3–5)

> Актуальный статус и инструкции для продолжения — в `CONTEXT.md` рядом с этим файлом.

---

## 1. Стратегическое решение

Рассматривались два пути:

| Вариант | Суть | Вердикт |
|---|---|---|
| **А. Рестайлинг монолита** | Перенести CSS-токены и вёрстку Kinetic в существующий `index.html` (88 КБ, vanilla JS) | ❌ Отклонён. Монолит и так на пределе поддерживаемости; анимации Motion и компонентную структуру макета в vanilla не перенести без деградации. Противоречит пункту бэклога «модульный рефакторинг» |
| **Б. Миграция логики в React** | Kinetic Gallery становится каркасом приложения; вся бизнес-логика Encar переносится слоями (services → hooks → views) | ✅ **Принят.** Макет уже собран на Vite + React 19 + Tailwind 4, содержит deploy.yml под GitHub Pages. Закрывает сразу два пункта бэклога: рефакторинг и responsive grid |

**Главный принцип:** функциональный паритет проверяется чек-листом (раздел 7) — ни одна возможность текущего приложения не теряется. Старый `index.html` остаётся в репозитории как `legacy/index.html` до полной приёмки.

---

## 2. Инвентаризация функционала (что нельзя потерять)

Извлечено из анализа `extracted.js` (54 КБ JS, 35 функций):

### Поиск
- **AI-режим:** `parseNL()` → YandexGPT (`llm.api.cloud.yandex.net/foundationModels/v1/completion`), парсинг естественного языка в параметры поиска; обработка ответа через `r.text()` → `JSON.parse()` (защита от HTML-ответов)
- **Структурный режим:** каскад `onMakerChange → onModelChange → toggleBadgeGroup`, словари `MAKERS_KR` и `MODELGROUPS` с точными корейскими именами API
- **Запрос:** `buildQuery()` — nested-синтаксис `C.CarType.Y._.(C.Manufacturer.기아._.ModelGroup.EV6.)` (плоские структуры возвращают ~0 результатов — критическое знание!)
- `getCarType()`, пагинация `fetchPage()`, оркестрация `doSearch()`

### Результаты
- `parseCar()` — маппинг ответа API: цена (маны воны), фото-URL со стрипом суффиксов `_NNN.jpg`, thumbnail c `impolicy=heightRate` + watermark-подавлением, эвристика привода (AWD/FWD/RWD) из Badge/BadgeDetail
- `renderCars()`, `makeCard()`, сортировка `doSort()`, фильтр по badge `filterBadge()` / `buildBadgeFilter()`
- Фото: `loadPhotos()`, карусель `slide()`, ленивая загрузка `autoLoadVisiblePhotos()` — **здесь живёт баг CORS/путей (п. 1 бэклога)**
- AI-анализ карточки: `aiOne()`

### Персистентность
- Избранное: `localStorage['encar_favs']` (`loadFavs/saveFavs/toggleFav/renderFavs/clearFavs`)
- Настройки: `localStorage['encar_cfg']` (`loadCfg/saveSettings`) — ключи YandexGPT (API key, folder ID), прокси и пр.

### PWA
- `manifest.json` со `start_url: /Search/index.html` (критично для установки из подкаталога GitHub Pages)
- `sw.js` (кэш `encar-v4`)

### UX-мелочи
- `toast()`, `setLoading()`, предупреждение CORS (`corsWarn`), пустое состояние (`empBox`)

---

## 3. Целевая архитектура

```
Search/                          # тот же репозиторий
├── legacy/index.html            # старая версия — страховка до приёмки
├── index.html                   # Vite entry
├── manifest.json                # start_url: /Search/index.html (сохранить!)
├── sw.js                        # переписать под hashed-ассеты Vite
├── vite.config.ts               # base: '/Search/' (вместо './')
├── .github/workflows/deploy.yml # из макета, поправить под ветку main
└── src/
    ├── api/
    │   ├── encar.ts             # buildQuery, fetchPage, doSearch, getCarType
    │   ├── encarParser.ts       # parseCar, photoUrls, driveHeuristic
    │   └── yandexGpt.ts         # parseNL, aiOne (r.text()→JSON.parse!)
    ├── data/
    │   ├── makers.ts            # MAKERS_KR — перенести КАК ЕСТЬ
    │   └── modelGroups.ts       # MODELGROUPS — перенести КАК ЕСТЬ
    ├── hooks/
    │   ├── useSearch.ts         # состояние поиска, пагинация, сортировка
    │   ├── useFavorites.ts      # encar_favs (тот же ключ → миграция бесплатна)
    │   ├── useSettings.ts       # encar_cfg (тот же ключ)
    │   └── useCarPhotos.ts      # ленивая загрузка, IntersectionObserver
    ├── components/              # из макета: CarCard, Navigation + новые
    │   ├── CarCard.tsx          # адаптировать под EncarCar
    │   ├── PhotoCarousel.tsx    # порт slide()
    │   ├── Toast.tsx            # порт toast()
    │   └── AiSearchBar.tsx      # НОВОЕ: поле NL-запроса поверх Inventory
    ├── views/                   # из макета
    │   ├── InventoryView.tsx    # = vSearch + vResults
    │   ├── FiltersView.tsx      # ПЕРЕДЕЛАТЬ: каскад марка→модель→badge
    │   ├── SavedView.tsx        # = vFavs
    │   ├── SettingsView.tsx     # ПЕРЕДЕЛАТЬ: ключи YandexGPT, прокси
    │   └── CarDetailsView.tsx   # НОВОЕ для нас: полноэкранная карточка + aiOne
    └── types.ts                 # EncarCar вместо mock Car
```

Слои строго однонаправленные: `views → hooks → api/data`. В `api/` — ни одной строчки про React.

---

## 4. Маппинг модели данных

`parseCar()` уже возвращает почти готовую структуру. Новый тип:

```ts
export interface EncarCar {
  id: string;
  url: string;                 // encar.com/dc/dc_cardetailview.do?carid=
  manufacturer: string;
  modelGroup: string;
  model: string;
  badge: string;
  badgeDetail: string;
  year: number;                // из YYYYMM
  month: number;
  mileageKm: number;
  priceKrw: number;            // маны → воны, конверсия в UI
  fuel: string;
  gearbox: string;
  displacement: string;
  drive: 'AWD' | 'FWD' | 'RWD' | '';
  thumbnail: string;           // с impolicy + watermark
  photos: string[];            // 8 кандидатов _001.._008
}
```

Маппинг на UI макета:

| Поле макета (`Car`) | Источник (`EncarCar`) |
|---|---|
| `make` | `manufacturer` |
| `model` | `modelGroup + badge` |
| `price` | `priceKrw` (+ конверсия ₩→₽/$ по настройке) |
| `image` | `thumbnail` |
| `specs.miles` | `mileageKm` |
| `specs.engine` | `fuel + displacement` |
| `specs.transmission` | `gearbox` |
| `specs.drive` | `drive` |
| `tags` | генерируем: «Свежее объявление», год, тип топлива |

---

## 5. Маппинг экранов

| Экран макета | Что происходит |
|---|---|
| **InventoryView** | Локальный mock-фильтр удаляется. Сверху — `AiSearchBar` (NL-запрос → YandexGPT → `showParsed`-теги → поиск). Ниже — грид результатов Encar с сортировкой и «загрузить ещё». Responsive grid 1/3/4 колонки (**п. 4 бэклога — закрывается дизайном макета**) |
| **FiltersView** (bottom sheet) | Каркас и анимация Motion остаются. Содержимое: каскад Производитель → Модель (из `MODELGROUPS`) → BadgeGroup → Badge, + год (`buildYears`), пробег, цена. Manufacturer/fuel-чипы макета переиспользуются как паттерн |
| **SavedView** | Подключается к `useFavorites` (тот же ключ `encar_favs` — избранное пользователей переживает миграцию автоматически) |
| **SettingsView** | Мок-профиль «Alex Sterling» удаляется. Поля: YandexGPT API key + Folder ID, CORS-прокси, валюта отображения, кнопка «очистить избранное». Ключ `encar_cfg` сохраняется |
| **CarDetailsView** | Бонус макета: полноэкранная карточка. Наполняем: карусель всех 8 фото, полные спеки, кнопка «AI-анализ» (`aiOne`), ссылка на encar.com |
| **Navigation** | Bottom nav (моб.) + sidebar (десктоп) — как в макете. Лого «KINETIC» → название проекта |

---

## 6. Поэтапный план работ (для Claude Code)

### ✅ Фаза 0 — Подготовка — ВЫПОЛНЕНО (Fable 5, 2026-07-05)
- Ветка `redesign` в репо `Search`; текущий `index.html` → `legacy/`
- Залить каркас Kinetic Gallery; **удалить** `@google/genai`, `express`, `.env.example` (наследие AI Studio, не используются)
- `vite.config.ts`: `base: '/Search/'`
- ✅ Критерий выполнен: `npm run build` зелёный (361 КБ / 112 КБ gzip), пути в dist — `/Search/assets/...`. Дополнительно: legacy скопирован в `public/legacy/` (останется доступен по `/Search/legacy/`), в CI добавлен шаг parity-теста. ⚠️ В настройках репо переключить Pages на «GitHub Actions»

### ✅ Фаза 1 — Слой API — ВЫПОЛНЕНО (Fable 5, 2026-07-05)
- Портировать `buildQuery/fetchPage/doSearch/getCarType` → `src/api/encar.ts` (чистые функции, без DOM)
- Портировать `parseCar` → `encarParser.ts`, `parseNL/aiOne` → `yandexGpt.ts`
- Перенести словари `MAKERS_KR`, `MODELGROUPS` без изменений
- ✅ Критерий выполнен: `npm run test:parity` — 5/5 кейсов (Kia EV6, BMW 5시리즈+BadgeGroup, только марка, пустые параметры, foreign+Porsche) побайтово совпали с эталонами, сгенерированными прогоном оригинальной legacy-функции в Node. Живой запрос к API — при первом локальном запуске (из песочницы недоступен, домен вне allowlist)

### ✅ Фаза 2 — Хуки и состояние — ВЫПОЛНЕНО (Fable 5, 2026-07-05)
- `useSearch`, `useFavorites`, `useSettings`, `useCarPhotos`
- ✅ Критерий выполнен: `useFavorites`/`useSettings` читают те же ключи `encar_favs`/`encar_cfg` с той же схемой; дополнительно созданы `useSearch` (статусы, сортировка, badge-фильтр, AI-preview), `useCarPhotos` (проверка кандидатов с диагностикой) и `lib/adapter.ts` (EncarCar → UI-тип макета). Финальная проверка на реальных данных браузера — в Фазе 3

### ⏳ Фаза 3 — Экраны (2–3 дня) — Claude Code
- InventoryView + AiSearchBar + сортировка → FiltersView-каскад → SettingsView → SavedView → CarDetailsView
- Toast, лоадеры, пустые состояния, corsWarn — в стилистике макета
- ✅ Критерий: полный чек-лист паритета (раздел 7) проходит на мобильном и десктопе

### ⏳ Фаза 4 — Фото (совмещаем с п. 1 бэклога) (0.5–1 день) — Claude Code
- В `useCarPhotos` — диагностика: логирование фактических URL, проверка вариантов суффиксов, фолбэк-перебор `_001…_008`, обработка `onerror`
- Если подтвердится CORS — прокси-настройка из `useSettings`
- ✅ Критерий: фото открываются минимум у 90% карточек в выдаче

### ⏳ Фаза 5 — PWA и релиз (0.5 дня) — Claude Code
- `manifest.json`: `start_url`/`scope` = `/Search/index.html` (проверено ранее — иначе 404 при переустановке)
- `sw.js`: precache манифеста Vite (плагин `vite-plugin-pwa` — рекомендую вместо ручного sw)
- Смоук на установленной PWA → мердж в `main`, `legacy/` живёт ещё 2 недели
- ✅ Критерий: установка PWA с телефона, офлайн-открытие оболочки

**Итого: ~6–8 рабочих дней.**

---

## 7. Чек-лист функционального паритета (приёмка)

- [ ] AI-поиск: «киа ев6 до 30 млн вон» возвращает релевантную выдачу
- [ ] Распознанные параметры показаны тегами до запуска поиска
- [ ] Структурный поиск: каскад марка → модель → badge работает для Hyundai/Kia/Genesis/BMW
- [ ] Nested-query формируется идентично legacy
- [ ] Пагинация «загрузить ещё»
- [ ] Сортировка (цена ↑↓, год, пробег)
- [ ] Badge-фильтр по выдаче
- [ ] Фото: карусель, ленивая загрузка, watermark-подавление на thumbnail
- [ ] AI-анализ отдельной машины
- [ ] Избранное: добавить/убрать/очистить, **старые данные не потеряны**
- [ ] Настройки: ключи YandexGPT сохраняются, **старый конфиг подхвачен**
- [ ] Ссылка на карточку encar.com открывается
- [ ] Toast-уведомления и состояния загрузки/пустоты
- [ ] PWA устанавливается и открывается офлайн
- [ ] Грид: 1 колонка (моб.) / 3 (десктоп) / 4 (широкий)

---

## 8. Риски и решения

| Риск | Митигация |
|---|---|
| Регресс nested-query при портировании | Юнит-тест на побайтовое совпадение строки запроса с legacy (Фаза 1) |
| CORS Encar API из браузера ведёт себя иначе после смены origin-структуры | Origin не меняется (тот же `kcepofopmpa.github.io`); corsWarn и настройка прокси сохраняются |
| Слом установленных PWA у пользователей | `start_url` не меняется; sw бампает версию кэша и делает `skipWaiting + clients.claim` |
| Tailwind 4: токены `bg-surface`, `text-primary` и т.д. определены в `index.css` макета | Перенести `index.css` целиком; тема тёмная в обоих проектах — конфликтов нет |
| Потеря словарей при переносе | Копирование файлом, diff по количеству записей (75 производителей / 930 моделей) |
| Остатки AI Studio (`GEMINI_API_KEY` в define) | Удалить из `vite.config.ts` в Фазе 0 |

---

## 9. Что попутно закрывается из бэклога

1. **Фото не грузятся** → Фаза 4 (приоритет №1 бэклога)
2. **Responsive grid 1/3/4** → дизайн макета из коробки (№4)
3. **Модульная архитектура** → сама суть миграции (№5)

Остаются: Badge/trim каталог (№2) и BadgeGroup-данные (№3) — не блокируют, добавляются в `src/data/` по мере поступления DevTools-данных.
