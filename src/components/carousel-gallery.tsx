import { useRef, useState } from 'react'
import { Carousel, CarouselContent, CarouselItem } from './ui/carousel'
import Autoplay from 'embla-carousel-autoplay'
import { Dialog, DialogContent } from './ui/dialog'

export type GalleryImage = { tile: string; full: string }

type Props = { images: GalleryImage[] }

export const CarouselGallery: React.FC<Props> = ({ images }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const touchStart = useRef<{ x: number; t: number } | null>(null)

  return (
    <div className="relative">
      <Carousel
        opts={{ align: 'start', loop: true, duration: 40, dragFree: true }}
        plugins={[
          Autoplay({
            delay: 3000,
            stopOnInteraction: false,
            playOnInit: true,
            active: selectedIndex === null,
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
                onClick={() => setSelectedIndex(i)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <Dialog
        open={selectedIndex !== null}
        onOpenChange={() => setSelectedIndex(null)}
      >
        <DialogContent
          showCloseButton={false}
          className="p-0 bg-transparent border-none max-w-10/12 aspect-square"
          onClick={() => setSelectedIndex(null)}
        >
          <img
            src={selectedIndex != null ? images[selectedIndex].full : undefined}
            className="w-full h-full rounded-lg object-cover"
            onTouchStart={(e) => {
              touchStart.current = { x: e.touches[0].clientX, t: Date.now() }
            }}
            onTouchEnd={(e) => {
              if (!touchStart.current) return
              const dx = e.changedTouches[0].clientX - touchStart.current.x
              const dt = Date.now() - touchStart.current.t
              if (Math.abs(dx) > 40) {
                setSelectedIndex((i) =>
                  i === null
                    ? i
                    : (i + (dx > 0 ? -1 : 1) + images.length) % images.length,
                )
              } else if (Math.abs(dx) < 10 && dt < 300) {
                setSelectedIndex(null) // tap closes
              }
              touchStart.current = null
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
