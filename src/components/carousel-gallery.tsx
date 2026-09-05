import { useState } from 'react'
import { Carousel, CarouselContent, CarouselItem } from './ui/carousel'
import Autoplay from 'embla-carousel-autoplay'
import { Dialog, DialogContent } from './ui/dialog'

export type GalleryImage = { tile: string; full: string }

type Props = { images: GalleryImage[] }

export const CarouselGallery: React.FC<Props> = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  return (
    <div className="relative">
      <Carousel
        opts={{ align: 'start', loop: true, duration: 40 }}
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
          {images.map((img, i) => (
            <CarouselItem key={img.tile} className="basis-1/2">
              <img
                src={img.tile}
                srcSet={`${img.tile} 480w, ${img.full} 960w`}
                sizes="(min-width: 768px) 500px, 50vw"
                width={480}
                height={480}
                loading={i === 0 ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={i === 0 ? 'high' : 'auto'}
                className="aspect-square object-cover"
                onClick={() => setSelectedImage(img.full)}
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
          />
        </DialogContent>
      </Dialog>
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent" />
    </div>
  )
}
