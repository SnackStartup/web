import { StarIcon } from 'lucide-react'
import { formatRating } from '#/lib/google-reviews'

const STAR_COUNT = 5

export type GoogleStarsProps = {
  value: number
  size?: number
}

/*
 * Display only: ui/rating renders a radiogroup with a hidden form input, and an
 * input inside a button is not markup the browser keeps, so this draws its own
 * stars. Filled stars only, count = rating rounded: 4,9 shows five and 4,0 four,
 * with the exact value in the number beside it and in the aria-label.
 */
export const GoogleStars: React.FC<GoogleStarsProps> = ({
  value,
  size = 16,
}) => {
  const filled = Math.max(0, Math.min(STAR_COUNT, Math.round(value)))
  return (
    <span
      role="img"
      aria-label={`${formatRating(value)} z ${STAR_COUNT}`}
      className="inline-flex shrink-0 items-center gap-0.5 text-[#f8cc2f]"
    >
      {Array.from({ length: filled }, (_, index) => (
        <StarIcon key={index} size={size} fill="currentColor" />
      ))}
    </span>
  )
}
