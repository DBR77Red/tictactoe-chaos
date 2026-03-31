export default async function GamePage({
  params,
}: {
  params: Promise<{ locale: string; roomId: string }>
}) {
  const { roomId } = await params

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-8 p-8">
      <h1 className="text-2xl font-bold">Game Room</h1>
      <p className="text-muted-foreground">Room ID: {roomId}</p>
      <p className="text-muted-foreground">Game board coming in Task 05.</p>
    </main>
  )
}
