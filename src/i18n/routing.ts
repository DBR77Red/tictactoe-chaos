import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'pt', 'de', 'es'],
  defaultLocale: 'en'
})
