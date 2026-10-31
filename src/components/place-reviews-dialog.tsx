import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { GoogleStars } from '#/components/google-stars'
import { PlaceReviewCard } from '#/components/place-review-card'
import { Button } from '#/components/ui/button'
import {
  formatRating,
  googleReviewFormUrl,
  reviewCountLabel,
} from '#/lib/google-reviews'
import type { ApiGoogleReviews } from '#/api/places/types'

export type PlaceReviewsDialogProps = {
  open: boolean
  placeName: string
  googlePlaceId: string
  reviews: ApiGoogleReviews
  // Draft preview: content and reading links work, but the write-review link to a
  // real Google listing stays inert.
  preview?: boolean
  onOpenChange: (open: boolean) => void
  // Fired for each link that leaves for Google.
  onLinkClicked: (
    target: 'all-reviews' | 'review' | 'flag' | 'write-review',
  ) => void
}

/*
 * Google requires the rating and reviews to sit with their attribution, and that
 * text stays legible on a plain surface where the photo-backed page does not. So
 * all Google Maps content lives in this dialog and the page shows only the rating.
 */
export const PlaceReviewsDialog: React.FC<PlaceReviewsDialogProps> = ({
  open,
  placeName,
  googlePlaceId,
  reviews,
  preview = false,
  onOpenChange,
  onLinkClicked,
}) => {
  const rating = reviews.rating
  const count = reviews.rating_count ?? 0
  // Google picks the five reviews and the API has no parameter for another
  // order, so the best rated go first here; the sort is stable, so equal ratings
  // keep Google's relevance order.
  const ranked = [...reviews.reviews].sort((a, b) => b.rating - a.rating)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Opinie Google</DialogTitle>
          <DialogDescription>
            {placeName}: oceny i opinie gości z Google Maps.
          </DialogDescription>
        </DialogHeader>

        {rating !== null && (
          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/40 px-3 py-2">
            <span className="text-2xl font-semibold">
              {formatRating(rating)}
            </span>
            <div className="flex flex-col gap-1">
              <GoogleStars value={rating} />
              <span className="text-xs text-muted-foreground">
                {reviewCountLabel(count)}
              </span>
            </div>
            <span
              translate="no"
              className="ml-auto self-end text-xs text-muted-foreground"
            >
              Google Maps
            </span>
          </div>
        )}

        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
          {ranked.map((review) => (
            <PlaceReviewCard
              key={review.id || `${review.author_name}-${review.relative_time}`}
              review={review}
              onLinkClicked={onLinkClicked}
            />
          ))}

          <p className="text-xs text-muted-foreground">
            Opinie w Google nie są weryfikowane, ale Google usuwa fałszywe
            treści.
          </p>
        </div>

        {/*
          The list scrolls and the footer sits outside it, so the write-review
          link stays on screen however many reviews Google returned. A sticky
          footer cannot: the dialog content is a grid, and a sticky item cannot
          leave its grid row.
        */}
        <DialogFooter className="flex-col gap-2 border-t border-border/60 pt-4 sm:flex-col">
          {/*
            Writing a review is the goal and reading on is secondary, so the
            filled button is the write link.
          */}
          {reviews.maps_uri && (
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              nativeButton={false}
              render={
                <a
                  href={reviews.maps_uri}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onLinkClicked('all-reviews')}
                />
              }
            >
              Zobacz wszystkie opinie w Google Maps
            </Button>
          )}
          {preview ? (
            <Button size="lg" disabled className="w-full">
              Oceń nas w Google
            </Button>
          ) : (
            <Button
              size="lg"
              className="w-full"
              nativeButton={false}
              render={
                <a
                  href={googleReviewFormUrl(googlePlaceId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onLinkClicked('write-review')}
                />
              }
            >
              Oceń nas w Google
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
