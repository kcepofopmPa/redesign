# CONTEXT.md — Encar Search v2 (редизайн Kinetic Gallery)

**Обновлено:** 2026-07-05 · **Сессия:** Fable 5 (планирование + Фазы 0–2) → **Claude Code (Фазы 3–5)**

---

## Что это

Миграция Encar Search PWA (поиск авто на корейском рынке) с монолитного `index.html` на React 19 + Vite + Tailwind 4, с дизайном из макета Kinetic Gallery. Полный план — `INTEGRATION_PLAN.md`. Оригинальное приложение — `legacy/index.html` (также копия в `public/legacy/` — остаётся доступным по `/Search/legacy/` после деплоя).

## Статус: что УЖЕ сделано (не переделывать)

✅ **Фаза 0 — каркас**
- Проект собран из макета Kinetic Gallery, наследие AI Studio удалено (`@google/genai`, `express`, `dotenv`, `GEMINI_API_KEY` из vite.config)
- `vite.config.ts`: `base: '/Search/'` — пути в билде проверены
- `manifest.json` → `public/`, `start_url: /Search/index.html` сохранён (критично: иначе 404 при переустановке PWA), добавлен `scope`
- `.github/workflows/deploy.yml`: install → parity-тест → build → deploy dist. **Внимание:** нужно переключить Pages в настройках репо с «deploy from branch» на «GitHub Actions»
- `npm run build` — зелёный (361 КБ JS / 112 КБ gzip)

✅ **Фаза 1 — слой API** (`src/api/`, чистые функции, ноль DOM)
- `encar.ts`: `buildQuery` / `fetchPage` / `searchCars` (бывш. doSearch) / `getCarType` + класс `CorsError`
- `encarParser.ts`: `parseCar` — фото-URL, thumbnail с watermark-подавлением, эвристика привода
- `yandexGpt.ts`: `parseNL` + `analyzeCar` (бывш. aiOne); паттерн `r.text()` → `JSON.parse` сохранён
- `src/data/`: `makers.ts` (MAKERS_KR), `modelGroups.ts` (MODELGROUPS, 775 строк), `badgeGroups.ts` (BADGE_GROUPS, пока 1 запись)
- **`npm run test:parity` — 5/5 кейсов побайтово совпали с legacy `buildQuery`.** Тест в CI. Если падает — nested-query сломан, не мерджить.

✅ **Фаза 2 — состояние** (`src/hooks/`)
- `useSettings` — ключ `encar_cfg` (как в legacy → конфиги пользователей подхватываются)
- `useFavorites` — ключ `encar_favs` (как в legacy → избранное переживает миграцию)
- `useSearch` — запуск, статусы (`idle/loading/done/cors/error`), сортировка, динамический badge-фильтр, AI-preview (`parsedPreview` = бывш. showParsed)
- `useCarPhotos` — последовательная проверка кандидатов `_001.._008` через `Image()` c диагностикой в консоль (фундамент Фазы 4)
- `src/lib/adapter.ts` — `encarToCard()`: EncarCar → UI-тип макета; вью работают без переписывания. Типы: `src/lib/types.ts` (старый `src/types.ts` — реэкспорт)

## Что ДЕЛАТЬ дальше (Фазы 3–5)

### Фаза 3 — экраны (основная работа)
Сейчас вью показывают `MOCK_CARS` из `src/constants.ts`. Подключить реальные данные:

1. **App.tsx**: заменить локальный стейт на хуки (`useSearch`, `useFavorites`, `useSettings`); `MOCK_CARS` и `constants.ts` удалить в конце фазы
2. **InventoryView**: добавить `AiSearchBar` (текстовый NL-запрос → `parseQuery` → теги `parsedPreview` → подтверждение → `run`); грид карточек из `visible` через `encarToCard`; сортировка (`sort/setSort`); badge-фильтр (`availableBadges`); состояния `loading` (с `progress`), `cors` (предупреждение + совет), `error`, пусто
3. **FiltersView**: заменить содержимое на каскад: Производитель (из `MAKERS_KR`) → Модель (`MODELGROUPS[maker]`, display = третий элемент кортежа, в query идёт второй!) → BadgeGroup (`BADGE_GROUPS[`${maker}:${modelGroup}`]`) + год (2010..текущий), пробег, цена в USD → конверсия в манвоны `Math.round(usd*1340/10000)` (как в legacy runSearch). Каркас bottom-sheet и Motion-анимации сохранить
4. **SettingsView**: убрать мок-профиль; поля: YandexGPT API key, Folder ID, карточек на страницу, курс USD, курс KRW; кнопка «Очистить избранное». Работать через `useSettings.save()`
5. **SavedView**: `favList` из `useFavorites`, карточки через `encarToCard`
6. **CarDetailsView**: карусель фото (`useCarPhotos` + все спеки EncarCar), кнопка «AI-анализ» → `analyzeCar` (при отсутствии ключей — тост + переход в настройки, как legacy), внешняя ссылка `car.url`
7. **CarCard**: показывать цену в USD и манвонах; тост-компонент (замена legacy `toast()`)

### Фаза 4 — фото-баг (п.1 бэклога)
`useCarPhotos` уже логирует упавшие URL. Открыть выдачу, собрать консоль-диагностику: если `0/8 loaded` массово — смотреть точный URL первого кандидата vs реальный из DevTools encar.com. Известно: Photo ID ≠ Car ID, корректен только путь из поля `Photo` API; суффиксы бывают `_001.jpg`, `__001.jpg`, `_`.

### Фаза 5 — PWA + релиз
- `vite-plugin-pwa` вместо ручного sw.js (`registerType: 'autoUpdate'`); precache манифеста Vite
- Смоук чек-листа паритета из `INTEGRATION_PLAN.md` §7
- Переключить Pages на GitHub Actions, мердж `redesign` → `main`

## Критические знания (нарушение = регресс)

1. **Nested-query**: `C.CarType.Y._.(C.Manufacturer.기아._.ModelGroup.EV6.)` — плоские запросы дают ~0 результатов. Защищено `test:parity`
2. **localStorage-ключи** `encar_cfg` / `encar_favs` не менять — обратная совместимость с legacy-данными пользователей
3. **`start_url` = `/Search/index.html`** в манифесте — иначе 404 при переустановке PWA с поддиректории Pages
4. **YandexGPT**: всегда `r.text()` → `JSON.parse` (API возвращает HTML при ошибках)
5. **Фото**: не строить URL от Car ID — только от поля `Photo`
6. **MODELGROUPS**: кортеж `[key, apiName, display]` — в запрос идёт `apiName` (второй), в UI — `display` (третий)
7. **Live-тест API из этой песочницы невозможен** (api.encar.com вне сетевого allowlist) — первый живой прогон делать локально/в браузере

## Команды

```bash
npm install
npm run dev          # http://localhost:3000
npm run lint         # tsc --noEmit
npm run test:parity  # паритет buildQuery с legacy — 5/5 обязателен
npm run build        # dist/ под /Search/
```

## Бэклог после релиза
- Badge/trim каталог (п.2) и BadgeGroup-данные (п.3) — пополнять `src/data/badgeGroups.ts` из DevTools (iNav BadgeGroup facets), формат ключа `'<maker>:<modelGroup>'`
