import { useEffect, useState } from 'react'
import { isAxiosError } from 'axios'
import { useApiAdminGooglePlacesSearchQuery } from '#/api/admin/use-google-places-search-query'
import { useApiAdminGoogleReviewsQuery } from '#/api/admin/use-google-reviews-query'
import { Button } from '#/components/ui/button'
import { Field, FieldDescription, FieldLabel } from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { formatRating } from '#/lib/google-reviews'

const SEARCH_DEBOUNCE_MS = 400
const MIN_SEARCH_LENGTH = 2

// The API's reason ("Google Places API key is not configured", a Google failure)
// tells the admin what to fix, so it replaces the generic message when present.
const errorDetail = (error: unknown) => {
  if (!isAxiosError<{ detail?: unknown }>(error)) return null
  // A network failure has no response, hence the cast.
  const response = error.response as { data?: { detail?: unknown } } | undefined
  const detail = response?.data?.detail
  return typeof detail === 'string' ? detail : null
}

const reviewsLabel = (count: number) =>
  count === 1 ? '1 review' : `${count} reviews`

export type AdminGooglePlaceFieldProps = {
  value: string | null
  // The refresh call needs the slug; a new place has none yet.
  placeId: string
  // The stored Google id. It differs from ``value`` until a newly picked venue is
  // saved, and refreshing earlier would ask about a link the database lacks.
  savedGooglePlaceId: string | null
  isNew: boolean
  onChange: (value: string | null) => void
}

/*
 * Links a place to its real Google listing. Search comes first, since picking the
 * wrong café of the same name is the one mistake this field can make; a pasted
 * place id still works for anyone who has it.
 */
export const AdminGooglePlaceField: React.FC<AdminGooglePlaceFieldProps> = ({
  value,
  placeId,
  savedGooglePlaceId,
  isNew,
  onChange,
}) => {
  const [query, setQuery] = useState('')
  const [term, setTerm] = useState('')
  const [showPaste, setShowPaste] = useState(false)
  const [pastedPlaceId, setPastedPlaceId] = useState('')
  const linkedPlaceId = (value ?? '').trim()
  const isSavedLink =
    linkedPlaceId !== '' && linkedPlaceId === (savedGooglePlaceId ?? '')
  const apiSearchQuery = useApiAdminGooglePlacesSearchQuery(term)
  // The same cached payload the guest page renders: the admin sees which listing
  // got linked without spending a Google call, since it is fetched once a day and
  // cached after that.
  const apiReviewsQuery = useApiAdminGoogleReviewsQuery(placeId, isSavedLink)

  useEffect(() => {
    const timeout = setTimeout(() => setTerm(query), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timeout)
  }, [query])

  const link = (nextPlaceId: string) => {
    onChange(nextPlaceId)
    setQuery('')
    setTerm('')
    setPastedPlaceId('')
  }

  const venue = apiReviewsQuery.data

  return (
    <Field>
      <FieldLabel htmlFor="place-google-venue">Google venue</FieldLabel>
      {linkedPlaceId ? (
        <div className="flex flex-col gap-3 rounded-lg border p-3">
          <div className="flex flex-col gap-0.5">
            {venue?.venue_name ? (
              <span className="text-sm font-medium">{venue.venue_name}</span>
            ) : (
              <span className="text-sm">
                Linked to{' '}
                <span className="font-mono text-xs">{linkedPlaceId}</span>
              </span>
            )}
            {venue?.venue_address && (
              <span className="text-xs text-muted-foreground">
                {venue.venue_address}
              </span>
            )}
            {venue?.available && (
              <span className="text-xs text-muted-foreground">
                {venue.rating === null
                  ? 'This venue has no reviews yet.'
                  : `${formatRating(venue.rating)} · ${reviewsLabel(venue.rating_count ?? 0)}`}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {venue?.maps_uri && (
              <Button
                variant="outline"
                nativeButton={false}
                render={
                  <a
                    href={venue.maps_uri}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                Open on Google Maps
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => onChange(null)}
            >
              Unlink
            </Button>
          </div>
          {!isSavedLink && (
            <p className="text-sm text-muted-foreground">
              {isNew
                ? "Save the place and it fetches this venue's reviews."
                : 'Save the place to fetch this venue and let guests see it.'}
            </p>
          )}
          {isSavedLink && !apiReviewsQuery.isFetching && !venue && (
            <p className="text-sm text-muted-foreground">
              Nothing cached for this venue yet. The preview fetches it.
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <Input
            id="place-google-venue"
            value={query}
            placeholder="Search Google for this venue"
            onChange={(event) => setQuery(event.target.value)}
          />
          {term.length >= MIN_SEARCH_LENGTH && apiSearchQuery.isFetching && (
            <p className="text-sm text-muted-foreground">Searching…</p>
          )}
          {apiSearchQuery.isError && (
            <p className="text-sm text-destructive">
              {errorDetail(apiSearchQuery.error) ?? 'Search failed.'}
            </p>
          )}
          {apiSearchQuery.data?.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No venues matched. Try adding the city, or paste the place id.
            </p>
          )}
          {apiSearchQuery.data?.map((result) => (
            <Button
              key={result.place_id}
              type="button"
              variant="outline"
              className="h-auto w-full flex-col items-start gap-1 px-3 py-2 text-left whitespace-normal"
              onClick={() => link(result.place_id)}
            >
              <span className="text-sm font-medium">{result.name}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {result.address}
              </span>
              {result.rating !== null && (
                <span className="text-xs font-normal text-muted-foreground">
                  {formatRating(result.rating)} ·{' '}
                  {reviewsLabel(result.rating_count ?? 0)}
                </span>
              )}
            </Button>
          ))}
          <div className="flex flex-wrap items-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPaste((previous) => !previous)}
            >
              {showPaste ? 'Hide place id' : 'Paste place id'}
            </Button>
            {showPaste && (
              <>
                <Input
                  value={pastedPlaceId}
                  placeholder="ChIJ…"
                  className="min-w-0 flex-1"
                  onChange={(event) => setPastedPlaceId(event.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  disabled={pastedPlaceId.trim() === ''}
                  onClick={() => link(pastedPlaceId.trim())}
                >
                  Link
                </Button>
              </>
            )}
          </div>
        </div>
      )}
      <FieldDescription>
        Guests see this venue's Google rating and reviews on the page. Save to
        fetch them, and the page keeps itself up to date once a day after that.
        Empty means no Google block.
      </FieldDescription>
    </Field>
  )
}
