import { CameraIcon, ShieldCheckIcon, StoreIcon } from 'lucide-react'
import { Badge } from '../ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'

const features = [
  {
    icon: CameraIcon,
    title: 'Dla gości',
    text: 'Szybko podzielisz się zdjęciem dania bez zakładania konta.',
  },
  {
    icon: StoreIcon,
    title: 'Dla restauracji',
    text: 'Gotowy materiał na social media prosto od Twoich gości.',
  },
  {
    icon: ShieldCheckIcon,
    title: 'Prywatnie i zgodnie z RODO',
    text: 'Zdjęcia publikujemy wyłącznie za Twoją zgodą.',
  },
]

export const HomeFeatures: React.FC = () => {
  return (
    <section id="dla-kogo" className="container mx-auto px-4">
      <div className="mb-10 flex flex-col items-center gap-2 text-center">
        <h2 className="text-3xl font-bold md:text-4xl">
          Zaprojektowany dla obu stron
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="h-full">
            <CardHeader className="flex flex-row items-center gap-4">
              <div className="flex size-11 items-center justify-center aspect-square rounded-lg border bg-muted">
                <feature.icon className="size-5 text-primary" />
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                {feature.text}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
