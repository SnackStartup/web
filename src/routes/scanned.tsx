import { Page } from '#/components/Page'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import { createFileRoute } from '@tanstack/react-router'
import { FaLocationDot, FaCamera, FaImage } from 'react-icons/fa6'

export const Route = createFileRoute('/scanned')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <Page>
      <div className="flex flex-row gap-2 items-center">
        <Skeleton className="size-18 rounded-full aspect-square" />
        <div>
          <h1 className="font-bold text-2xl">Cat cafe</h1>
          <p className="text-neutral-500">
            Cat cafe description lorem ipsum lorem ipsum lorem ipsum
          </p>
        </div>
      </div>
      <br />
      <div className="flex flex-row gap-2">
        <FaLocationDot className="size-5" />
        <p className="text-nowrap text-ellipsis overflow-hidden">
          Bydgoszcz, Michała Kleofasa Ogińskiego 4
        </p>
      </div>
      <br />
      <br />
      <Button className="h-30 text-xl w-full">
        <FaCamera className="size-9 mx-2" />
        Zrób zdjęcie
      </Button>
      <br />
      <br />
      <Button variant="secondary" className="h-30 text-xl w-full">
        <FaImage className="size-9 mx-2" />
        Wybierz z galerii
      </Button>
    </Page>
  )
}
