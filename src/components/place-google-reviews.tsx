import { useState } from 'react'
import { StarIcon } from 'lucide-react'
import { GoogleStars } from '#/components/google-stars'
import { PlaceReviewsDialog } from '#/components/place-reviews-dialog'
import {
  formatRating,
  googleReviewFormUrl,
  reviewCountLabel,
} from '#/lib/google-reviews'
import { cn } from '#/lib/utils'
import type { ApiGoogleReviews } from '#/api/places/types'

export type PlaceGoogleReviewsProps = {
  googlePlaceId?: string | null
  placeName: string
  reviews?: ApiGoogleReviews
  // Draft preview: the rating opens the dialog, but the write-review link posts
  // to a real Google listing, so it stays inert.
  preview?: boolean
  onCapture: (event: string, props?: Record<string, unknown>) => void
}

/*
 * The Google block in the header. No reviews yet gets a prompt; anything else
 * (unlinked venue, missing key, Google unreachable) shows nothing.
 */
export const PlaceGoogleReviews: React.FC<PlaceGoogleReviewsProps> = ({
  googlePlaceId,
  placeName,
  reviews,
  preview = false,
  onCapture,
}) => {
  const [isDialogOpen, setDialogOpen] = useState(false)
  const placeId = googlePlaceId?.trim() ?? ''

  if (!placeId || !reviews?.available) return null

  const props = { place_id: placeId, place_name: placeName }
  const rating = reviews.rating
  const writeReviewHref = googleReviewFormUrl(placeId)

  if (rating === null) {
    const promptClasses =
      'flex grow items-center gap-2 rounded-xl border border-primary/25 bg-background/60 px-3 py-2 text-sm'
    return preview ? (
      <span className={cn(promptClasses, 'opacity-60')}>
        <StarIcon className="size-4 shrink-0" />
        Jeszcze nie ma opinii w Google. Napisz pierwszą
      </span>
    ) : (
      <a
        href={writeReviewHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() =>
          onCapture('google_review_cta_clicked', {
            ...props,
            source: 'empty-state',
          })
        }
        className={cn(
          promptClasses,
          'active:scale-[0.98] transition-transform',
        )}
      >
        <StarIcon className="size-4 shrink-0" />
        Jeszcze nie ma opinii w Google. Napisz pierwszą
      </a>
    )
  }

  /*
   * flex-1 (0 basis): the card takes the width left beside the icons, 218px at
   * 390px, and wraps its text instead of pushing them onto a second row.
   */
  return (
    <div className="relative flex flex-1 flex-col gap-1 rounded-xl border border-primary/25 bg-background/60 px-3 py-2 transition-transform active:scale-[0.98]">
      {/*
        A stretched invisible button opens the reviews, so the keyboard gets a
        real control; the link below sits above it and keeps its own click.
      */}
      <button
        type="button"
        aria-label={`Opinie z Google: ${formatRating(rating)} z 5, ${reviewCountLabel(reviews.rating_count ?? 0)}`}
        onClick={() => {
          setDialogOpen(true)
          onCapture('google_reviews_opened', props)
        }}
        className="absolute inset-0 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      {/*
        Clicks on the text hit the button underneath. flex-wrap lets the line
        break inside the card: on one line the row measures 271px plus padding
        against 218px beside the icons at 390px, and the overflow pushed them down
        a row.
      */}
      <span className="pointer-events-none flex flex-wrap items-center gap-2 text-left">
        <GoogleStars value={rating} />
        <span className="text-sm font-semibold">{formatRating(rating)}</span>
        <span className="text-xs text-muted-foreground">
          ({reviewCountLabel(reviews.rating_count ?? 0)})
        </span>
      </span>
      {/*
        No icon: the row above draws the stars (the empty state keeps its own).
        No "Google Maps" label either: it took 75px of 218px at 390px and squeezed
        the row next to the link; without it the rating line also stops wrapping at
        375 and below. The source stays named in the link, the aria-label and the
        dialog.
      */}
      {preview ? (
        <span
          aria-disabled="true"
          className="relative z-10 flex w-fit text-xs text-muted-foreground opacity-60"
        >
          Oceń nas w Google
        </span>
      ) : (
        <a
          href={writeReviewHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            onCapture('google_review_cta_clicked', {
              ...props,
              source: 'page',
            })
          }
          className="relative z-10 flex w-fit text-xs text-muted-foreground underline hover:text-primary"
        >
          Oceń nas w Google
        </a>
      )}
      <PlaceReviewsDialog
        open={isDialogOpen}
        placeName={placeName}
        googlePlaceId={placeId}
        reviews={reviews}
        preview={preview}
        onOpenChange={setDialogOpen}
        onLinkClicked={(target) =>
          onCapture('google_reviews_link_clicked', { ...props, target })
        }
      />
    </div>
  )
}
