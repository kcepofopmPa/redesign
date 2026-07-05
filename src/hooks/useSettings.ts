// Настройки приложения. Ключ localStorage 'encar_cfg' — ИЗ LEGACY, НЕ МЕНЯТЬ:
// пользовательские конфиги переживают миграцию автоматически.

import { useCallback, useState } from 'react';
import { DEFAULT_CONFIG, type AppConfig } from '../lib/types';
import { setKrwRate } from '../api/encarParser';

const LS_KEY = 'encar_cfg';

function readConfig(): AppConfig {
  try {
    const s = localStorage.getItem(LS_KEY);
    if (s) return { ...DEFAULT_CONFIG, ...JSON.parse(s) };
  } catch { /* повреждённый JSON — используем дефолты */ }
  return { ...DEFAULT_CONFIG };
}

export function useSettings() {
  const [config, setConfig] = useState<AppConfig>(() => {
    const cfg = readConfig();
    setKrwRate(cfg.krw);
    return cfg;
  });

  const save = useCallback((patch: Partial<AppConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...patch };
      localStorage.setItem(LS_KEY, JSON.stringify(next));
      setKrwRate(next.krw);
      return next;
    });
  }, []);

  const hasAiKeys = Boolean(config.key && config.folder);

  return { config, save, hasAiKeys };
}
