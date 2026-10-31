// Google documents no "write a review" URL, but its own prompts use this one: it
// opens the venue's review form and asks the guest to sign in. If it breaks, fall
// back to googleMapsUri.
export const googleReviewFormUrl = (googlePlaceId: string) =>
  `https://search.google.com/local/writereview?placeid=${encodeURIComponent(googlePlaceId)}`

export const formatRating = (rating: number) =>
  new Intl.NumberFormat('pl-PL', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rating)

// Polish counts three ways: 1 opinia, 2-4 opinie, 5+ opinii; 12-14 take opinii
// despite ending in 2-4.
export const reviewCountLabel = (count: number) => {
  if (count === 1) return '1 opinia'
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} opinie`
  }
  return `${count} opinii`
}
