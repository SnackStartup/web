import { Page } from '#/components/Page'
import { Button } from '#/components/ui/button'
import {
  createFileRoute,
  Link,
  useLayoutEffect,
  useNavigate,
} from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import type { ChangeEventHandler, CSSProperties } from 'react'
import {
  FaLocationDot,
  FaCamera,
  FaImage,
  FaFacebook,
  FaInstagram,
} from 'react-icons/fa6'
import { FileUploadGallery } from '#/components/file-upload-gallery'
import { Rating, RatingItem } from '#/components/ui/rating'
import { Share2Icon, StarIcon } from 'lucide-react'
import { useApiUploadPhotosMutation } from '#/api/useApiUploadPhotosMutation'
import { ThanksScreen } from '#/components/ThanksScreen'
import { CarouselGallery } from '#/components/carousel-gallery'
import type { GalleryImage } from '#/components/carousel-gallery'
import { Separator } from '#/components/ui/separator'
import { Spinner } from '#/components/ui/spinner'
import { analyticsCapture } from '#/lib/analytics'
import { places } from '#/data/places'
import type { Place } from '#/data/places'
import { HighlightedText } from '#/components/highlighted-text'
import { NotFoundComponent } from '#/components/NotFoundComponent'
import invariant from 'tiny-invariant'
import { cn } from '#/lib/utils'

export const Route = createFileRoute('/scanned/$id')({
  component: RouteComponent,
})

function RouteComponent() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const inputFileRef = useRef<HTMLInputElement>(null)
  const apiUploadPhotosMutation = useApiUploadPhotosMutation()
  const navigate = useNavigate()
  const imageCaptureInputRef = useRef<HTMLInputElement>(null)
  const [showThanksScreen, setShowThanksScreen] = useState<boolean>(false)
  const canSharePics =
    navigator?.canShare && navigator.canShare({ files: selectedFiles })
  const isUploading = apiUploadPhotosMutation.isPending
  const [uploadFailed, setUploadFailed] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Map<File, number>>(
    new Map(),
  )
  const isUploadingDisabled = selectedFiles.length === 0 || isUploading
  const { id: placeId } = Route.useParams()
  const place = places[placeId as keyof typeof places] as Place | undefined
  const placeProps = { place_id: placeId, place_name: place?.name }
  const galleryImages: GalleryImage[] = [
    ...Array(place?.galleryCount ?? 0).keys(),
  ].map((n) => ({
    tile: `/places/${placeId}/tile-${n + 1}.webp`,
    full: `/places/${placeId}/full-${n + 1}.webp`,
  }))

  /*
   *
   * Effects
   *
   **/

  useEffect(() => {
    if (!isUploading) return
    const id = setInterval(() => {
      setUploadProgress((prev) => {
        const next = new Map(prev)
        let changed = false
        for (const f of prev.keys()) {
          const p = apiUploadPhotosMutation.getProgress(f)
          if (p !== prev.get(f)) {
            next.set(f, p)
            changed = true
          }
        }
        return changed ? next : prev
      })
    }, 100)
    return () => clearInterval(id)
  }, [isUploading, apiUploadPhotosMutation.getProgress])

  useLayoutEffect(() => {
    const isDark = place?.colorScheme === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
    return () => document.documentElement.classList.remove('dark')
  }, [place?.colorScheme])

  /*
   *
   * Handlers
   *
   */

  const handleCaptureImageButtonClicked = () => {
    imageCaptureInputRef.current?.click()
  }

  const handleSelectImageButtonClicked = () => {
    inputFileRef.current?.click()
  }

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const files = Array.from(event.target.files ?? [])
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files].slice(0, 6))
    }
    event.target.value = ''
  }

  const handleUploadButtonClicked = () => {
    setUploadFailed(false)
    setUploadProgress(new Map(selectedFiles.map((f) => [f, 0])))
    apiUploadPhotosMutation.mutate(
      { files: selectedFiles, placeId },
      {
        onSuccess() {
          setUploadProgress(new Map())
          setSelectedFiles([])
          setShowThanksScreen(true)
        },
        onError(error) {
          setUploadProgress(new Map())
          setUploadFailed(true)
        },
      },
    )
  }

  const handleShareButtonClicked = async () => {
    invariant(place)
    analyticsCapture('shared_page', placeProps)
    const shareData = {
      title: `Stolik — ${place.name}`,
      text: 'Zobacz zdjęcia dań i podziel się swoim talerzem!',
      url: window.location.href,
    }
    try {
      await window.navigator.share(shareData)
    } catch (error) {
      // ignore, user cancelled share
      console.error(error)
    }
  }

  const handleFacebookButtonClicked = async () => {
    analyticsCapture('facebook_clicked', placeProps)
  }

  const handleInstagramButtonClicked = async () => {
    analyticsCapture('instagram_clicked', placeProps)
  }

  const handleSharePicsButtonClicked = async () => {
    invariant(place)
    analyticsCapture('shared_pics', {
      ...placeProps,
      files: selectedFiles.map((file) => file.name),
    })
    if (canSharePics) {
      await navigator.share({
        title: `Stolik — ${place.name}`,
        files: selectedFiles,
      })
    }
  }

  const handleRatingClicked = () => {
    analyticsCapture('rating_clicked', placeProps)
  }

  /*
   *
   *
   *
   */

  if (!place) {
    return <NotFoundComponent />
  }

  const oopsNeonStyles: CSSProperties =
    placeId === 'oops'
      ? {
          animation: 'neon-pulse 2.5s ease-in-out infinite',
          borderStyle: 'var(--tw-border-style)',
          borderWidth: '2px',
          boxShadow: '2px 2px 0 0 var(--tw-shadow-color, #000)',
        }
      : {}

  return (
    <Page
      className={cn(
        'flex flex-col gap-6 relative min-h-screen overflow-hidden',
        place.colorScheme === 'dark' && 'dark',
      )}
      style={{ ['--primary' as string]: place.primaryColor }}
    >
      <div className="absolute inset-0 -z-10" aria-hidden>
        <img
          src={`/places/${placeId}/background.webp`}
          className="absolute inset-0 w-full h-full object-cover"
          decoding="async"
          fetchPriority="low"
          alt=""
          style={{
            opacity: place.backgroundOpacity,
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 md:h-56 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row gap-2 items-center">
            <img
              src={`/places/${placeId}/logo-96.webp`}
              decoding="async"
              fetchPriority="high"
              width={96}
              height={96}
              className="size-12 rounded-full aspect-square object-cover"
            />
            <h1
              className="text-xs text-left text-primary font-semibold"
              style={
                placeId === 'oops'
                  ? { animation: 'neon-text-pulse 2.5s ease-in-out infinite' }
                  : {}
              }
            >
              {place.suffix && (
                <>
                  {place.suffix}
                  <br />
                </>
              )}
              „{place.name}"
            </h1>
          </div>
          <div
            className="flex flex-row gap-1 items-center"
            onClick={() => navigate({ to: '/' })}
          >
            <h1 className="font-bold text-xl">Stolik</h1>
            <img
              src="/icon-96.png"
              decoding="async"
              className="size-10"
              style={
                placeId === 'oops'
                  ? {
                      animation: 'neon-logo-pulse 2.5s ease-in-out infinite',
                    }
                  : {}
              }
            />
          </div>
        </div>
        <div className="flex flex-row gap-2">
          <FaLocationDot className="size-5" />
          <p>{place.location}</p>
        </div>
        <div className="flex flex-row items-center justify-between">
          <Rating
            defaultValue={5}
            className="gap-1 text-[#f8cc2f]"
            onClick={handleRatingClicked}
          >
            {Array.from({ length: 5 }, (_, i) => (
              <RatingItem key={i} className="pointer-events-none">
                <StarIcon />
              </RatingItem>
            ))}
          </Rating>
          <div className="flex flex-row gap-4 items-center">
            <Button
              size="sm"
              className="p-0"
              variant="ghost"
              render={
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={place.instagramUrl}
                  onClick={handleInstagramButtonClicked}
                />
              }
            >
              <FaInstagram className="size-5" />
            </Button>
            <Button
              size="sm"
              className="p-0"
              variant="ghost"
              render={
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={place.facebookUrl}
                  onClick={handleFacebookButtonClicked}
                />
              }
            >
              <FaFacebook className="size-5" />
            </Button>
            <Button
              size="sm"
              className="p-0"
              variant="ghost"
              onClick={handleShareButtonClicked}
            >
              <Share2Icon className="size-5" />
            </Button>
          </div>
        </div>
      </div>
      <Separator
        className="bg-primary -my-2 opacity-25"
        style={oopsNeonStyles}
      />
      <CarouselGallery images={galleryImages} />
      <Separator
        className="bg-primary -my-2 opacity-25"
        style={oopsNeonStyles}
      />
      <div>
        <p className="text-sm">
          <HighlightedText text={place.description} neon={placeId === 'oops'} />
        </p>
      </div>
      <Separator
        className="bg-primary -my-2 opacity-25"
        style={oopsNeonStyles}
      />
      <div className="flex flex-col gap-2">
        <input
          ref={imageCaptureInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={handleFileChange}
          multiple
        />
        <Button
          className="h-20 text-xl w-full"
          style={{ ...oopsNeonStyles, borderWidth: '4px' }}
          onClick={handleCaptureImageButtonClicked}
          disabled={selectedFiles.length >= 6}
        >
          <FaCamera className="size-9 mx-2" />
          Zrób zdjęcie
        </Button>
        {selectedFiles.length > 0 && (
          <FileUploadGallery
            files={selectedFiles}
            onFilesChange={setSelectedFiles}
            progress={uploadProgress}
            uploading={isUploading}
          />
        )}
        {selectedFiles.length === 0 && (
          <>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={inputFileRef}
              hidden
              multiple
            />
            <Button
              variant="outline"
              className="h-20 text-xl w-full"
              onClick={handleSelectImageButtonClicked}
            >
              <FaImage className="size-9 mx-2" />
              Wybierz z galerii
            </Button>
          </>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {uploadFailed && (
          <p role="alert" className="text-sm text-destructive text-center">
            Nie udało się wysłać zdjęć. Sprawdź połączenie i spróbuj ponownie.
          </p>
        )}
        <Button
          disabled={isUploadingDisabled}
          size="lg"
          onClick={handleUploadButtonClicked}
          className="h-12"
          style={
            placeId === 'oops' && !isUploadingDisabled
              ? { ...oopsNeonStyles, borderWidth: '4px' }
              : undefined
          }
        >
          <span data-icon="inline-start">{isUploading && <Spinner />}</span>
          <span translate="no">
            {isUploading
              ? 'Wysyłanie'
              : uploadFailed
                ? 'Spróbuj ponownie'
                : 'Wyślij'}
          </span>
        </Button>
        {canSharePics && selectedFiles.length > 0 && (
          <Button
            variant="secondary"
            size="lg"
            onClick={handleSharePicsButtonClicked}
            className="h-12"
          >
            <Share2Icon />
            Udostępnij zdjęcia znajomym
          </Button>
        )}
      </div>
      <p className="text-xs text-neutral-400">
        Klikając przycisk „Wyślij", akceptujesz{' '}
        <Link
          to="/polityka-prywatnosci"
          className="underline hover:text-primary"
        >
          Politykę prywatności
        </Link>{' '}
        i{' '}
        <Link to="/regulamin" className="underline hover:text-primary">
          Regulamin
        </Link>{' '}
        serwisu.
      </p>
      <ThanksScreen
        visible={showThanksScreen}
        onVisibleChange={setShowThanksScreen}
        backgroundUri={`/places/${placeId}/background.webp`}
        backgroundOpacity={place.backgroundOpacity}
        neon={placeId === 'oops'}
      />
    </Page>
  )
}
