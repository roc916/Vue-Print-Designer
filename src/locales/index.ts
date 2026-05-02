import en from './en';
import zh from './zh';

export type AppLocale = 'zh' | 'en';

export const messages = {
  en,
  zh,
};

export const getInitialLanguage = (): AppLocale => {
  const stored = localStorage.getItem('print-designer-language');
  if (stored && (stored === 'zh' || stored === 'en')) {
    return stored;
  }
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith('zh')) {
    return 'zh';
  }
  return 'en';
};

export const setStoredLanguage = (locale: AppLocale) => {
  localStorage.setItem('print-designer-language', locale);
};

const getByPath = (source: unknown, path: string) => {
  return path.split('.').reduce<unknown>((current, segment) => {
    if (!current || typeof current !== 'object') return undefined;
    return (current as Record<string, unknown>)[segment];
  }, source);
};

const interpolate = (text: string, params?: Record<string, string | number>) => {
  if (!params) return text;
  return Object.entries(params).reduce(
    (next, [key, value]) => next.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value)),
    text
  );
};

export const translate = (
  locale: AppLocale,
  key: string,
  params?: Record<string, string | number>
) => {
  const value = getByPath(messages[locale], key) ?? getByPath(messages.en, key);
  if (typeof value !== 'string') return key;
  return interpolate(value, params);
};

export const createTranslator = (locale: AppLocale) => {
  return (key: string, params?: Record<string, string | number>) => translate(locale, key, params);
};

const i18n = {
  global: {
    locale: { value: getInitialLanguage() },
    t(key: string, params?: Record<string, string | number>) {
      return translate(this.locale.value, key, params);
    }
  }
};

export default i18n;
