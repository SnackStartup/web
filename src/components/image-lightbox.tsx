import { useEffect, useRef } from 'react'
import { Dialog, DialogContent } from '#/components/ui/dialog'
import { cn } from '#/lib/utils'

export type ImageLightboxProps = {
  images: string[]
  index: number | null
  onIndexChange: (index: number | null) => void
  className?: string
}

// One viewer for every enlarged image: the guest gallery and the admin panels
// both use it, so paging, swipe and Escape behave the same everywhere.
export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  images,
  index,
  onIndexChange,
  className,
}) => {
  const touchStart = useRef<{ x: number; t: number } | null>(null)

  useEffect(() => {
    if (index === null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onIndexChange(null)
      if (event.key === 'ArrowRight') onIndexChange((index + 1) % images.length)
      if (event.key === 'ArrowLeft') {
        onIndexChange((index - 1 + images.length) % images.length)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, images.length, onIndexChange])

  if (index === null || !images[index]) return null

  const step = (delta: number) =>
    onIndexChange((index + delta + images.length) % images.length)

  return (
    <Dialog open onOpenChange={() => onIndexChange(null)}>
      <DialogContent
        showCloseButton={false}
        className={cn('max-w-[90vw] border-none bg-transparent p-0', className)}
      >
        <img
          src={images[index]}
          alt=""
          className="max-h-[85vh] w-full rounded-lg object-contain"
          onTouchStart={(event) => {
            touchStart.current = {
              x: event.touches[0].clientX,
              t: Date.now(),
            }
          }}
          onTouchEnd={(event) => {
            if (!touchStart.current) return
            const dx = event.changedTouches[0].clientX - touchStart.current.x
            const dt = Date.now() - touchStart.current.t
            if (Math.abs(dx) > 40) step(dx > 0 ? -1 : 1)
            else if (Math.abs(dx) < 10 && dt < 300) onIndexChange(null)
            touchStart.current = null
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
