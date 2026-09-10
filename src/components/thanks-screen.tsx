import { useEffect } from 'react'
import { FaHeart, FaInstagram, FaXmark } from 'react-icons/fa6'

import './thanks-screen.css'
import { cn } from '#/lib/utils'

type Props = {
  visible: boolean
  onVisibleChange: (visible: boolean) => void
  backgroundUri: string
  backgroundOpacity?: string
  neon?: boolean
  shareFiles?: File[]
  canShareFiles?: boolean
  onInstagramShare?: () => void
}

export const ThanksScreen: React.FC<Props> = ({
  visible,
  onVisibleChange,
  backgroundUri,
  backgroundOpacity,
  neon,
  shareFiles,
  canShareFiles,
  onInstagramShare,
}) => {
  useEffect(() => {
    if (!visible) return
    const timeout = setTimeout(() => {
      onVisibleChange(false)
    }, 12000)
    return () => clearTimeout(timeout)
  }, [visible])

  // scroll to top & lock body scroll
  useEffect(() => {
    if (!visible) return
    window.scrollTo({ top: 0, behavior: 'instant' })
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [visible])

  const showInstagramShare = canShareFiles && (shareFiles?.length ?? 0) > 0

  return (
    <div
      style={{ touchAction: 'none' }}
      className={cn(
        'fixed inset-0 z-50 bg-background overflow-hidden transition-opacity duration-500',
        visible
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none',
      )}
    >
      <img
        src={backgroundUri}
        className="absolute inset-0 w-full h-full object-cover z-0"
        alt=""
        style={{
          opacity: backgroundOpacity,
        }}
      />
      <div className="relative z-10 flex flex-col items-center justify-center gap-2 h-full">
        {visible && (
          <>
            <div className="absolute left-0 -top-1 h-3 w-screen overflow-hidden rounded-r-full bg-primary animate-countdown" />
            <button
              type="button"
              aria-label="Zamknij"
              onClick={() => onVisibleChange(false)}
              className="absolute top-4 right-4 rounded-full bg-black/40 p-2 text-white active:scale-95 transition-transform"
            >
              <FaXmark className="size-5" />
            </button>
          </>
        )}
        <FaHeart className="size-20 text-pink-500 animate-bounce" />
        <h1
          className="text-primary text-3xl font-bold"
          style={
            neon
              ? { animation: 'neon-text-pulse 2.5s ease-in-out infinite' }
              : undefined
          }
        >
          Dziękujemy!
        </h1>
        <h2 className="text-neutral-400">Zgłoszenie zostało przyjęte</h2>
        {showInstagramShare && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={onInstagramShare}
              className="flex items-center gap-3 rounded-full px-6 py-3 text-white font-semibold text-lg active:scale-95 transition-transform shadow-lg"
              style={{
                background:
                  'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              }}
            >
              <FaInstagram className="size-6" />
              Wrzuć na Instagrama
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
