// ═══════════════════════════════════════════════════════════════
// parseCar: маппинг сырого объекта Encar API → EncarCar.
// Портировано 1:1 из legacy/index.html.
//
// ⚠️ Photo ID ≠ Car ID на Encar — корректный путь есть ТОЛЬКО в
//    поле Photo из API. Фолбэк по ID строит неверные URL (не делать).
// ═══════════════════════════════════════════════════════════════

import { FUEL_RU, type EncarCar, type EncarRawCar } from '../lib/types';

const PHOTO_CDN = 'https://ci.encar.com/carpicture';
const WATERMARK = 'https://ci.encar.com/wt_mark/w_mark_04.png';

/** Курсы для отображения; при инициализации приложения перезаписываются из настроек */
let krwRate = 0.0675;
export function setKrwRate(rate: number) { krwRate = rate || 0.0675; }

export function parseCar(c: EncarRawCar): EncarCar {
  const pmw = c.Price || 0;
  const yr = String(c.Year || '000000');
  const photoField = c.Photo || c.photo || null;
  const photos: string[] = [];
  let thumbnail = '';

  if (photoField) {
    const photoBase = PHOTO_CDN + photoField;
    // Strip _NNN.jpg suffix (with any number of leading underscores) OR bare trailing underscores.
    // API Photo field may arrive as "41781201_001.jpg", "41781201__001.jpg", or just "41781201_".
    const base = photoBase.replace(/(_+\d{3}\.jpg.*|_+)$/i, '');
    for (let i = 1; i <= 8; i++) {
      photos.push(`${base}_${String(i).padStart(3, '0')}.jpg`);
    }
    // Thumbnail: small crop + small brand watermark (suppresses the full-size watermark)
    thumbnail = photos[0] + `?impolicy=heightRate&rh=384&cw=640&ch=384&cg=Center&wtmk=${WATERMARK}`;
  }

  const badgeRaw = c.Badge || '';
  const badgeDetail = c.BadgeDetail || '';
  const gearbox = c.Gearbox || '';
  const displacement = c.Displacement ? `${c.Displacement}cc` : '';

  // Привод: эвристика по тексту Badge/BadgeDetail
  let drive: EncarCar['drive'] = '';
  const driveText = (badgeRaw + ' ' + badgeDetail).toLowerCase();
  if (
    driveText.includes('4wd') || driveText.includes('awd') || driveText.includes('4x4') ||
    driveText.includes('xdrive') || driveText.includes('quattro') || driveText.includes('e-four') ||
    driveText.includes('sxdrive') || driveText.includes('syncro') || driveText.includes('fulltime')
  ) {
    drive = 'AWD';
  } else if (driveText.includes('2wd') || driveText.includes('fwd') || driveText.includes('rwd')) {
    drive = driveText.includes('rwd') ? 'RWD' : 'FWD';
  }

  return {
    id: String(c.Id || ''),
    url: `https://www.encar.com/dc/dc_cardetailview.do?carid=${c.Id}`,
    manufacturer: c.Manufacturer || '',
    model: c.Model || '',
    badge: badgeRaw,
    badgeDetail,
    displacement,
    gearbox,
    drive,
    year: yr.slice(0, 4),
    month: yr.slice(4, 6),
    mileage_km: parseInt(String(c.Mileage || 0)),
    fuel: c.FuelType || '',
    fuel_ru: FUEL_RU[c.FuelType || ''] || c.FuelType || '',
    region: c.OfficeCityState || '',
    pmw,
    usd: Math.round(pmw * 10000 / 1340),
    rub: Math.round(pmw * 10000 * krwRate),
    photos,
    thumbnail,
    ai: '',
  };
}
