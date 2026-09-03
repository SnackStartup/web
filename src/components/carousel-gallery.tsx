import { useEffect, useState } from 'react'
import { Carousel, CarouselContent, CarouselItem } from './ui/carousel'
import Autoplay from 'embla-carousel-autoplay'
import { Dialog, DialogContent } from './ui/dialog'

type Props = {
  images: string[]
}

export const CarouselGallery: React.FC<Props> = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  return (
    <div className="relative">
      <Carousel
        opts={{
          align: 'start',
          loop: true,
          duration: 40,
        }}
        plugins={[
          Autoplay({
            delay: 3000,
            stopOnInteraction: false,
            playOnInit: true,
            active: selectedImage === null,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent>
          {images.map((url) => (
            <CarouselItem key={url} className="basis-1/2">
              <img
                src={url}
                className="aspect-square object-cover"
                onClick={() => setSelectedImage(url)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent
          showCloseButton={false}
          className="p-0 bg-transparent border-none max-w-10/12 aspect-square"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage ?? undefined}
            className="w-full h-full rounded-lg object-cover"
            loading="lazy"
          />
        </DialogContent>
      </Dialog>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent" />
    </div>
  )
}
