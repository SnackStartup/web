import { useEffect } from 'react'
import { FaHeart } from 'react-icons/fa6'

import './ThanksScreen.css'

type Props = {
  visible: boolean
  onVisibleChange: (visible: boolean) => void
}

export const ThanksScreen: React.FC<Props> = ({ visible, onVisibleChange }) => {
  useEffect(() => {
    if (!visible) return
    const timeout = setTimeout(() => {
      onVisibleChange(false)
    }, 5000)
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

  return (
    <div
      // kills pinch-to-zoom on mobile
      style={{ touchAction: 'none' }}
      className={`
          absolute inset-0 bg-white
          flex flex-col items-center justify-center gap-2
          transition-opacity duration-500
          pointer-events-none
          ${visible ? 'opacity-100' : 'opacity-0'}
        `}
    >
      {visible && (
        <div className="absolute left-0 -top-1 h-3 w-screen overflow-hidden rounded-full bg-primary animate-countdown" />
      )}
      <FaHeart className="size-20 text-pink-500 animate-bounce" />
      <h1 className="text-primary text-3xl font-bold">Dziękujemy!</h1>
      <h2 className="text-neutral-400">Zgłoszenie zostało przyjęte</h2>
    </div>
  )
}
