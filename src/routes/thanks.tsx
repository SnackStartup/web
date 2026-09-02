import { Page } from '#/components/Page'
import { createFileRoute } from '@tanstack/react-router'
import { FaHeart } from 'react-icons/fa6'

export const Route = createFileRoute('/thanks')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Page className="flex flex-col items-center justify-center h-full gap-2">
      <FaHeart className="size-20 text-pink-500 animate-bounce" />
      <h1 className="text-primary text-3xl font-bold">Dziękujemy!</h1>
      <h2 className="text-neutral-400">Zgłoszenie zostało przyjęte</h2>
    </Page>
  )
}
