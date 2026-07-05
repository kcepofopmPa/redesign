// BadgeGroup-факты из iNav API (топливо + привод).
// Ключ: '<maker>:<modelGroup(ru/kr, как в API)>'. Пополняется DevTools-данными (п.2-3 бэклога).

export const BADGE_GROUPS: Record<string, string[]> = {
  'bmw:5시리즈': ['가솔린 2WD', '가솔린 4WD', '디젤 2WD', '디젤 4WD', '가솔린+전기 2WD'],
};
