import { useEffect } from 'react'
import { FaHeart, FaMugHot, FaInstagram, FaXmark, FaEye } from 'react-icons/fa6'

import './thanks-screen.css'
import { cn } from '#/lib/utils'
import type { FreeCoffeeReason } from '#/api/photos/use-api-photos-upload-mutation'
import { Page } from './page'
import { GoogleLogin } from '@react-oauth/google'
import { Spinner } from './ui/spinner'

const COFFEE_REASON_MESSAGES: Record<FreeCoffeeReason, string> = {
  granted: 'Oto twoja kawa za pierwsze zdjęcie w naszym lokalu!',
  already_redeemed:
    'Kawa od naszego lokalu już należy do Ciebie, dziękujemy za kolejne zdjęcie!',
  budget_exhausted:
    'Dziś kawy w naszym lokalu już się rozeszły, ale Twoje zdjęcie jest bezcenne, zajrzyj do nas kiedy indziej!',
}

type CoffeeInfo = {
  reason: FreeCoffeeReason
}

type Props = {
  visible: boolean
  onVisibleChange: (visible: boolean) => void
  backgroundUri: string
  backgroundOpacity?: string
  neon?: boolean
  shareFiles?: File[]
  onInstagramShare?: () => void
  coffeeInfo?: CoffeeInfo
  verifyingCoffee?: boolean
  onGoogleSuccess?: (idToken: string) => void
}

export const ThanksScreen: React.FC<Props> = ({
  visible,
  onVisibleChange,
  backgroundUri,
  backgroundOpacity,
  neon,
  shareFiles,
  onInstagramShare,
  coffeeInfo,
  verifyingCoffee,
  onGoogleSuccess,
}) => {
  const hasCoffee = coffeeInfo?.reason === 'granted'
  const hasCoffeeNotice = coffeeInfo != null && !hasCoffee
  const coffeeMessage = coffeeInfo
    ? COFFEE_REASON_MESSAGES[coffeeInfo.reason]
    : undefined

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

  const showInstagramShare = (shareFiles?.length ?? 0) > 0

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
      <div className="relative z-10 flex flex-col items-center justify-center gap-2 h-full p-8">
        {visible && (
          <button
            type="button"
            aria-label="Zamknij"
            onClick={() => onVisibleChange(false)}
            className="absolute top-4 right-4 rounded-full bg-black/40 p-2 text-white active:scale-95 transition-transform"
          >
            <FaXmark className="size-5" />
          </button>
        )}
        {hasCoffee ? (
          <FaMugHot className="size-20 text-primary" />
        ) : (
          <FaHeart className="size-20 text-pink-500 animate-bounce" />
        )}
        <h1
          className="text-3xl font-bold text-center"
          style={
            neon
              ? { animation: 'neon-text-pulse 2.5s ease-in-out infinite' }
              : undefined
          }
        >
          {hasCoffee ? 'Darmowa kawa czeka!' : 'Dziękujemy!'}
        </h1>
        <h2 className="text-neutral-400 text-center">
          {coffeeMessage ?? 'Zgłoszenie zostało przyjęte'}
        </h2>
        {(!coffeeInfo || verifyingCoffee) && (
          <div className="mt-6 flex w-full max-w-sm flex-col gap-3 items-center">
            <GoogleLogin
              theme="outline"
              shape="pill"
              text="continue_with"
              ux_mode="popup"
              onSuccess={(cred) => onGoogleSuccess?.(cred.credential ?? '')}
              onError={() => onGoogleSuccess?.('__error__')}
              auto_select={false}
            />
            {verifyingCoffee && <Spinner className="size-6" />}
            <p className="text-xs text-neutral-400 text-center">
              Zaloguj się, aby odebrać darmową kawę za pierwsze zdjęcie
            </p>
          </div>
        )}
        {hasCoffee && (
          <div
            className="mt-8 flex w-full max-w-sm flex-col items-center gap-1 rounded-2xl bg-primary px-5 py-4 text-center shadow-xl animate-attention"
            style={
              neon
                ? {
                    boxShadow:
                      '0 0 0 3px var(--primary), 0 0 28px var(--primary)',
                  }
                : undefined
            }
          >
            <FaEye className="size-8 text-primary-foreground" />
            <p className="text-base font-bold uppercase tracking-wide text-primary-foreground">
              Pokaż ten ekran obsłudze
            </p>
            <p className="text-sm text-primary-foreground/80">
              aby odebrać darmową kawę
            </p>
          </div>
        )}
        {hasCoffeeNotice && (
          <div className="mt-3 flex items-center gap-2 rounded-full border border-neutral-500/50 px-4 py-2 text-neutral-400">
            <FaMugHot className="size-4 text-neutral-500" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Zajrzyj do nas ponownie
            </span>
          </div>
        )}
        {showInstagramShare && !hasCoffee && (
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
