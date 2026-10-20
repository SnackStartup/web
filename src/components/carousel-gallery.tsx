import { useState } from 'react'
import { Carousel, CarouselContent, CarouselItem } from './ui/carousel'
import Autoplay from 'embla-carousel-autoplay'
import { ImageLightbox } from './image-lightbox'

export type GalleryImage = { id: string; tile: string; full: string }

type Props = { images: GalleryImage[] }

export const CarouselGallery: React.FC<Props> = ({ images }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

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
            <CarouselItem key={img.id} className="basis-1/2">
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
      <ImageLightbox
        images={images.map((img) => img.full)}
        index={selectedIndex}
        onIndexChange={setSelectedIndex}
      />
    </div>
  )
}
