import { Page } from './page'
import { LuCircleAlert } from 'react-icons/lu'
import { Button } from './ui/button'

export const ErrorComponent: React.FC<{
  error: Error
  reset: () => void
}> = ({ reset }) => {
  return (
    <Page className="flex flex-col items-center justify-center h-full gap-16 mt-16">
      <div className="flex flex-col gap-2 items-center">
        <LuCircleAlert className="size-20" />
        <h1 className="text-primary text-3xl font-bold">Coś poszło nie tak</h1>
        <h2 className="text-neutral-400">Wystąpił nieoczekiwany błąd</h2>
      </div>
      <Button size="lg" className="p-6" onClick={reset}>
        Spróbuj ponownie
      </Button>
    </Page>
  )
}
