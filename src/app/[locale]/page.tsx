import { useTranslations } from 'next-intl'
import { HomeClient } from './HomeClient'

export default function HomePage() {
  const t = useTranslations('nav')

  return (
    <main className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center p-6 gap-10">
      {/* Neon title */}
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-3xl sm:text-4xl font-black font-mono uppercase tracking-widest text-[#ff2d7a] [filter:drop-shadow(0_0_16px_#ff2d7a)_drop-shadow(0_0_32px_#ff2d7a60)]">
          {t('title')}
        </h1>
        <div className="h-px w-48 bg-gradient-to-r from-transparent via-[#7b2fff] to-transparent" />
      </div>

      <HomeClient />
    </main>
  )
}
