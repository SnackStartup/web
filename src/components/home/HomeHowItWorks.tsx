import { CameraIcon, QrCodeIcon, SendIcon } from 'lucide-react'
import { Badge } from '../ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card'

const steps = [
  {
    title: 'Zeskanuj kod QR',
    icon: QrCodeIcon,
    text: 'Skanujesz kod przy stoliku, po czym otwiera się strona Twojej restauracji.',
  },
  {
    title: 'Zrób albo wybierz zdjęcie',
    icon: CameraIcon,
    text: 'Robisz zdjęcie telefonem lub wgrywasz je z galerii, jedno albo kilka.',
  },
  // {
  //   title: 'Oceń danie',
  //   icon: Star,
  //   text: 'Dodajesz krótką ocenę gwiazdkami i opcjonalny komentarz.',
  // },
  {
    title: 'Wyślij',
    icon: SendIcon,
    text: 'Wysyłasz jednym przyciskiem. Dziękujemy za udział!',
  },
]

export const HomeHowItWorks: React.FC = () => {
  return (
    <section id="jak-to-dziala" className="container mx-auto px-4">
      <div className="mb-10 flex flex-col items-center gap-2 text-center">
        <h2 className="text-3xl font-bold md:text-4xl">Jak to działa</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <Card key={index} className="h-full relative">
            <step.icon className="absolute top-6 right-5 size-6 text-muted-foreground/40" />
            <CardHeader>
              <Badge className="mb-2 w-fit text-base rounded-full aspect-square p-3">
                {index + 1}
              </Badge>
              <CardTitle className="text-lg">{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                {step.text}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
