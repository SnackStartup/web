import { Page } from './Page'
import { LuCircleAlert } from 'react-icons/lu'
import { Button } from './ui/button'
import { Link, useNavigate } from '@tanstack/react-router'

export const NotFoundComponent: React.FC = () => {
  const navigate = useNavigate()

  const handleBackButtonClicked = () => {
    navigate({ to: '/scanned' })
  }

  return (
    <Page className="flex flex-col items-center justify-center h-full gap-16">
      <div className="flex flex-col gap-2 items-center">
        <LuCircleAlert className="size-20" />
        <h1 className="text-primary text-3xl font-bold">Strona nie istnieje</h1>
        <h2 className="text-neutral-400">Wygląda na to że zabłądziłeś</h2>
      </div>
      <Button size="lg" className="p-6" onClick={handleBackButtonClicked}>
        Powrót do strony głównej
      </Button>
    </Page>
  )
}
