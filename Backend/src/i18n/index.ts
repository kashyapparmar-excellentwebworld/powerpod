import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import path from 'path'

export type Feature = 'common' | 'auth' | 'validation'

export async function initI18n(): Promise<void> {
  await i18next.use(Backend).init({
    lng: 'en',
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar'],
    preload: ['en', 'ar'],
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      loadPath: path.join(__dirname, 'locales/{{lng}}.json'),
    },
    interpolation: {
      escapeValue: false,
    },
  })
}

export function t(feature: Feature, key: string, lng: string, options?: object): string {
  return i18next.t(`${feature}.${key}`, { lng, ...options })
}
