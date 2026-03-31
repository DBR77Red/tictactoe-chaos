import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const t = useTranslations('room')

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-8 p-8">
      <h1 className="text-4xl font-bold tracking-tight">Tic-Tac-Toe Chaos</h1>
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <Button size="lg">{t('create')}</Button>
        <Button variant="outline" size="lg">{t('join')}</Button>
      </div>
    </main>
  )
}
