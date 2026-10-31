import { GoogleStars } from '#/components/google-stars'
import type { ApiGoogleReview } from '#/api/places/types'

export type PlaceReviewCardProps = {
  review: ApiGoogleReview
  onLinkClicked: (target: 'review' | 'flag') => void
}

export const PlaceReviewCard: React.FC<PlaceReviewCardProps> = ({
  review,
  onLinkClicked,
}) => (
  <div className="flex flex-col gap-2 rounded-xl border border-border/60 p-3">
    <div className="flex items-center gap-2">
      {review.author_photo_uri ? (
        <img
          src={review.author_photo_uri}
          alt=""
          loading="lazy"
          className="size-8 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
          {review.author_name.slice(0, 1).toUpperCase()}
        </span>
      )}
      <div className="flex min-w-0 flex-col">
        {review.author_uri ? (
          <a
            href={review.author_uri}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-sm font-medium underline-offset-3 hover:underline"
          >
            {review.author_name}
          </a>
        ) : (
          <span className="truncate text-sm font-medium">
            {review.author_name}
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          {review.relative_time}
        </span>
      </div>
      <span className="ml-auto flex">
        <GoogleStars value={review.rating} size={14} />
      </span>
    </div>
    {review.text && (
      <p className="whitespace-pre-line text-sm">{review.text}</p>
    )}
    {/*
      Google sets originalText when it translated the review, but also returns the
      same string when it only looked translated, so identical text is skipped.
    */}
    {review.original_text && review.original_text !== review.text && (
      <p className="text-xs text-muted-foreground">
        Przetłumaczono z: „{review.original_text}”
      </p>
    )}
    {(review.google_maps_uri || review.flag_content_uri) && (
      <div className="flex items-center gap-3">
        {review.google_maps_uri && (
          <a
            href={review.google_maps_uri}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onLinkClicked('review')}
            className="text-xs underline hover:text-primary"
          >
            Zobacz w Google Maps
          </a>
        )}
        {review.flag_content_uri && (
          <a
            href={review.flag_content_uri}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onLinkClicked('flag')}
            className="text-xs text-muted-foreground underline hover:text-primary"
          >
            Zgłoś opinię
          </a>
        )}
      </div>
    )}
  </div>
)
