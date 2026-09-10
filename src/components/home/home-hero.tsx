import { Button } from '../ui/button'
import { ArrowDownIcon, ArrowRight } from 'lucide-react'
import { Separator } from '../ui/separator'

export const HomeHero: React.FC = () => {
  return (
    <section className="container mx-auto flex flex-col items-center gap-8 px-4 text-center">
      <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
        Podziel się zdjęciem dania ze swoją restauracją
      </h1>

      <p className="max-w-xl text-lg text-muted-foreground">
        Zeskanuj kod QR przy stoliku, zrób albo wybierz zdjęcie i wyślij je
        restauracji. Twoje zdjęcie może trafić na ich social media.
      </p>

      <Button
        size="lg"
        className="w-2/3 px-8 sm:w-auto"
        render={<a href="#jak-to-dziala" />}
      >
        <ArrowDownIcon />
        Zobacz więcej
      </Button>
    </section>
  )
}
