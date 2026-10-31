import { useEffect } from 'react'
import {
  FaHeart,
  FaMugHot,
  FaInstagram,
  FaXmark,
  FaEye,
  FaStar,
} from 'react-icons/fa6'

import './thanks-screen.css'
import { cn } from '#/lib/utils'
import { googleReviewFormUrl } from '#/lib/google-reviews'
import type { FreeCoffeeReason } from '#/api/photos/use-upload-mutation'
import { GoogleLogin } from '@react-oauth/google'
import { Button } from './ui/button'
import { Spinner } from './ui/spinner'
import { WalletInvite } from './wallet/wallet-invite'

const COFFEE_REASON_MESSAGES: Record<FreeCoffeeReason, string> = {
  granted: 'Oto twoja kawa za pierwsze zdjęcie w naszym lokalu!',
  already_redeemed:
    'Kawa od naszego lokalu już należy do Ciebie, dziękujemy za kolejne zdjęcie!',
  budget_exhausted:
    'Dziś kawy w naszym lokalu już się rozeszły, ale Twoje zdjęcie jest bezcenne, zajrzyj do nas kiedy indziej!',
}

// 296x40 pill, the size GSI paints the Google sign-in button at (width={296}
// below pins it). That iframe cannot be restyled, so the review button copies its
// white fill, #dadce0 hairline and 14px medium text, and starts content 12px in
// like the Google mark. Labels stay short: nowrap would run a longer one past the
// pill, and p-8 leaves 296px on a 360px phone.
const ACTION_CLASSES =
  'flex h-10 w-full max-w-[296px] items-center justify-start gap-2.5 rounded-full pl-3 pr-4 text-sm font-medium whitespace-nowrap active:scale-95 transition-transform'

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
  // The venue's Google id, when the place is linked.
  googlePlaceId?: string | null
  // Draft preview: the offer renders but stays inert, since it posts to a real
  // Google listing.
  preview?: boolean
  onGoogleReviewClick?: () => void
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
  googlePlaceId,
  preview = false,
  onGoogleReviewClick,
}) => {
  const hasCoffee = coffeeInfo?.reason === 'granted'
  const hasCoffeeNotice = coffeeInfo != null && !hasCoffee
  const coffeeMessage = coffeeInfo
    ? COFFEE_REASON_MESSAGES[coffeeInfo.reason]
    : undefined

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
      {backgroundUri && (
        <img
          src={backgroundUri}
          className="absolute inset-0 w-full h-full object-cover z-0"
          alt=""
          style={{
            opacity: backgroundOpacity,
          }}
        />
      )}
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
        {/* More air above the block than inside: the copy leads it. */}
        {visible && (!coffeeInfo || verifyingCoffee) && (
          <div className="mt-10 flex w-full max-w-[296px] flex-col items-center gap-3">
            {/*
              Theme colour, not fixed grey: the venue's background is light or
              dark. text-balance keeps two even lines; otherwise "pierwsze
              zdjęcie" sits alone on the second.
            */}
            <p className="text-center text-sm text-foreground/80 text-balance">
              Zaloguj się, aby odebrać darmową kawę za pierwsze zdjęcie
            </p>
            {/* Left alone GSI sizes this to its label, so the column drifts. */}
            <GoogleLogin
              theme="outline"
              shape="pill"
              size="large"
              width={296}
              text="continue_with"
              ux_mode="popup"
              onSuccess={(cred) => onGoogleSuccess?.(cred.credential ?? '')}
              onError={() => onGoogleSuccess?.('__error__')}
              auto_select={false}
            />
            {verifyingCoffee && <Spinner className="size-6" />}
          </div>
        )}
        {hasCoffee && (
          <>
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
            <WalletInvite />
          </>
        )}
        {hasCoffeeNotice && (
          <div className="mt-3 flex items-center gap-2 rounded-full border border-neutral-500/50 px-4 py-2 text-neutral-400">
            <FaMugHot className="size-4 text-neutral-500" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              Zajrzyj do nas ponownie
            </span>
          </div>
        )}
        {/*
          Every state, never gated on the coffee outcome or the guest's mood:
          Google forbids review gating. A star, not the G (a second sign-in
          button), in Google's #FBBC05.
        */}
        {googlePlaceId &&
          (preview ? (
            <span
              aria-disabled="true"
              className={cn(
                ACTION_CLASSES,
                'mt-1 border border-[#dadce0] bg-white text-[#3c4043] opacity-60',
              )}
            >
              <FaStar className="size-5 shrink-0 text-[#FBBC05]" />
              Oceń nas w Google
            </span>
          ) : (
            <a
              href={googleReviewFormUrl(googlePlaceId)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onGoogleReviewClick}
              className={cn(
                ACTION_CLASSES,
                'mt-1 border border-[#dadce0] bg-white text-[#3c4043] hover:bg-[#f8f9fa]',
              )}
            >
              <FaStar className="size-5 shrink-0 text-[#FBBC05]" />
              Oceń nas w Google
            </a>
          ))}
        {showInstagramShare && !hasCoffee && (
          <div className="mt-1 flex w-full flex-col items-center gap-2">
            <button
              type="button"
              onClick={onInstagramShare}
              className={cn(ACTION_CLASSES, 'text-white shadow-lg')}
              style={{
                background:
                  'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
              }}
            >
              <FaInstagram className="size-5" />
              Wrzuć na Instagrama
            </button>
          </div>
        )}
        {/*
          Same exit as the X. mt-8: a 32px box around a 16px line puts the text
          48px under the last pill, matching the step above the sign-in copy.
        */}
        {visible && (
          <Button
            variant="link"
            size="sm"
            onClick={() => onVisibleChange(false)}
            className="mt-8 text-foreground/70 underline"
          >
            Nie, dziękuję
          </Button>
        )}
      </div>
    </div>
  )
}
