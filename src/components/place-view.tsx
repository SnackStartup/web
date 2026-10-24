import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
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
import { useApiPhotosUploadMutation } from '#/api/photos/use-upload-mutation'
import type { FreeCoffeeReason } from '#/api/photos/use-upload-mutation'
import { ThanksScreen } from '#/components/thanks-screen'
import { CarouselGallery } from '#/components/carousel-gallery'
import type { GalleryImage } from '#/components/carousel-gallery'
import { AdminLink } from '#/components/admin/admin-link'
import { Separator } from '#/components/ui/separator'
import { Button, buttonVariants } from '#/components/ui/button'
import { Spinner } from '#/components/ui/spinner'
import { analyticsCapture } from '#/lib/analytics'
import { HighlightedText } from '#/components/highlighted-text'
import { Page } from '#/components/page'
import { useApiPlacesQuery } from '#/api/places/use-places-query'
import type { ApiPlace } from '#/api/places/types'
import { useApiClaimMutation } from '#/api/auth/use-claim-mutation'
import { useApiGoogleAuthMutation } from '#/api/auth/use-google-auth-mutation'
import { useApiIsAdminQuery } from '#/api/admin/use-is-admin-query'
import { useThanksStore, THANKS_TTL_MS } from '#/lib/thanks-store'
import { WalletBar } from '#/components/wallet/wallet-bar'
import { cn } from '#/lib/utils'

export type PlaceViewProps = {
  place: ApiPlace
  placeId: string
  // Admin preview of an unpublished place: same page, controls inert.
  preview?: boolean
  onPlaceRefetch?: () => void
}

export const PlaceView: React.FC<PlaceViewProps> = ({
  place,
  placeId,
  preview = false,
  onPlaceRefetch,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const inputFileRef = useRef<HTMLInputElement>(null)
  const apiPhotosUploadMutation = useApiPhotosUploadMutation()
  const navigate = useNavigate()
  const imageCaptureInputRef = useRef<HTMLInputElement>(null)
  const [showThanksScreen, setShowThanksScreen] = useState<boolean>(false)
  const [shareFiles, setShareFiles] = useState<File[]>([])
  const isUploading = apiPhotosUploadMutation.isPending
  const [uploadFailed, setUploadFailed] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Map<File, number>>(
    new Map(),
  )
  const isUploadingDisabled = selectedFiles.length === 0 || isUploading
  const apiPlacesQuery = useApiPlacesQuery()
  const apiIsAdminQuery = useApiIsAdminQuery()
  const placeProps = { place_id: placeId, place_name: place.name }
  const galleryImages: GalleryImage[] = place.gallery.map((image) => ({
    id: image.id,
    tile: image.tile_url,
    full: image.full_url,
  }))
  const [coffeeInfo, setCoffeeInfo] = useState<
    { reason: FreeCoffeeReason } | undefined
  >()
  const [uploadId, setUploadId] = useState<string | null>(null)
  const [verifyingCoffee, setVerifyingCoffee] = useState(false)
  const [showCoffeeCounter, setShowCoffeeCounter] = useState(false)
  const apiClaimMutation = useApiClaimMutation()
  const apiGoogleAuthMutation = useApiGoogleAuthMutation()
  const clientTapTimesRef = useRef<number[]>([])
  const thanksStore = useThanksStore()
  const restoredRef = useRef(false)

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
          const p = apiPhotosUploadMutation.getProgress(f)
          if (p !== prev.get(f)) {
            next.set(f, p)
            changed = true
          }
        }
        return changed ? next : prev
      })
    }, 100)
    return () => clearInterval(id)
  }, [isUploading, apiPhotosUploadMutation.getProgress])

  useEffect(() => {
    if (preview || restoredRef.current) return
    restoredRef.current = true
    if (
      !thanksStore.uploadId ||
      thanksStore.placeId !== placeId ||
      !thanksStore.savedAt ||
      Date.now() - thanksStore.savedAt > THANKS_TTL_MS
    ) {
      if (thanksStore.uploadId) thanksStore.clear()
      return
    }
    setUploadId(thanksStore.uploadId)
    setCoffeeInfo(
      thanksStore.coffeeReason
        ? { reason: thanksStore.coffeeReason }
        : undefined,
    )
    setShowThanksScreen(true)
  }, [placeId, preview, thanksStore])

  useLayoutEffect(() => {
    const isDark = place.color_scheme === 'dark'
    document.documentElement.classList.toggle('dark', isDark)
    return () => document.documentElement.classList.remove('dark')
  }, [place.color_scheme])

  /*
   *
   * Handlers
   *
   */

  const capture = (event: string, props?: Record<string, unknown>) => {
    if (preview) return
    analyticsCapture(event, props)
  }

  const handleCaptureImageButtonClicked = () => {
    if (preview) return
    imageCaptureInputRef.current?.click()
  }

  const handleSelectImageButtonClicked = () => {
    if (preview) return
    inputFileRef.current?.click()
  }

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    if (preview) return
    const files = Array.from(event.target.files ?? [])
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files].slice(0, 6))
    }
    event.target.value = ''
  }

  const handleUploadButtonClicked = () => {
    if (preview) return
    setUploadFailed(false)
    setUploadProgress(new Map(selectedFiles.map((f) => [f, 0])))
    apiPhotosUploadMutation.mutate(
      { files: selectedFiles, placeId },
      {
        onSuccess(data) {
          setUploadProgress(new Map())
          setShareFiles(apiPhotosUploadMutation.getCompressedFiles())
          setSelectedFiles([])
          if (data.uploadId) {
            setUploadId(data.uploadId)
            thanksStore.saveUpload(placeId, data.uploadId)
          }
          setCoffeeInfo(undefined) // wait for google
          setShowThanksScreen(true)
        },
        onError() {
          setUploadProgress(new Map())
          setUploadFailed(true)
        },
      },
    )
  }

  const handleShareButtonClicked = async () => {
    capture('shared_page', placeProps)
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
    capture('facebook_clicked', placeProps)
  }

  const handleInstagramButtonClicked = async () => {
    capture('instagram_clicked', placeProps)
  }

  const handleSharePicsButtonClicked = async () => {
    capture('shared_pics', {
      ...placeProps,
      files: selectedFiles.map((file) => file.name),
    })
    try {
      await navigator.share({
        title: `Stolik — ${place.name}`,
        files: selectedFiles,
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleThanksInstagramShare = async () => {
    capture('thanks_instagram_share', placeProps)
    try {
      await navigator.share({
        title: `Stolik — ${place.name}`,
        text: 'Zobacz zdjęcia dań i podziel się swoim talerzem!',
        files: shareFiles,
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleThanksVisibleChange = (visible: boolean) => {
    setShowThanksScreen(visible)
    if (!visible) {
      setShareFiles([])
      setCoffeeInfo(undefined)
      thanksStore.clear()
    }
  }

  const handleRatingClicked = () => {
    capture('rating_clicked', placeProps)
  }

  const handleClientLogoClicked = () => {
    if (preview || isUploading) return
    const now = Date.now()
    clientTapTimesRef.current = [
      ...clientTapTimesRef.current.filter((t) => now - t <= 600),
      now,
    ]
    const taps = clientTapTimesRef.current.length
    if (taps === 2) setShowCoffeeCounter((prev) => !prev) // toggle on/off
    if (taps >= 3) {
      clientTapTimesRef.current = []
      setShowCoffeeCounter(false)
      const ids = apiPlacesQuery.data?.map((p) => p.id) ?? []
      if (ids.length === 0) return
      const currentIndex = ids.indexOf(placeId)
      navigate({
        to: '/scanned/$id',
        params: { id: ids[(currentIndex + 1) % ids.length] },
      })
    }
  }

  const handleGoogleSuccess = async (idToken: string) => {
    if (!idToken || idToken === '__error__' || !uploadId) return
    setVerifyingCoffee(true)
    try {
      await apiGoogleAuthMutation.mutateAsync({ idToken })
      const result = await apiClaimMutation.mutateAsync({ placeId, uploadId })
      setCoffeeInfo(result.reason ? { reason: result.reason } : undefined)
      if (result.reason) thanksStore.setCoffeeReason(result.reason)
      if (result.free_coffee) capture('free_coffee_granted', placeProps)
      onPlaceRefetch?.()
    } catch (error) {
      setCoffeeInfo({ reason: 'budget_exhausted' })
      thanksStore.setCoffeeReason('budget_exhausted')
      console.error(error)
    } finally {
      setVerifyingCoffee(false)
    }
  }

  /*
   *
   *
   *
   */

  const neonStyles: CSSProperties = place.neon
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
        'relative flex flex-col gap-6 overflow-hidden min-h-screen',
        'mx-auto w-full max-w-xl lg:max-w-2xl px-6 py-6',
        place.color_scheme === 'dark' && 'dark',
      )}
      style={{ ['--primary' as string]: place.primary_color }}
    >
      <div className="fixed inset-0 -z-10" aria-hidden>
        {place.background_url && (
          <img
            src={place.background_url}
            className="absolute inset-0 w-full h-full object-cover"
            decoding="async"
            fetchPriority="low"
            alt=""
            style={{
              opacity: place.background_opacity,
            }}
          />
        )}
        <div className="absolute inset-x-0 bottom-0 h-40 md:h-56 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>
      {preview && (
        <div className="relative z-10 flex flex-row items-center justify-between gap-3 rounded border border-amber-500/60 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
          <span className="font-medium">
            Draft preview. Only admins can see this.
          </span>
          <Link
            to="/admin/place/$id"
            params={{ id: placeId }}
            className="shrink-0 underline"
          >
            Back to editor
          </Link>
        </div>
      )}
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-start justify-between">
          <div className="flex flex-row gap-2 items-center">
            <div className="relative">
              {place.logo_url && (
                <img
                  src={place.logo_url}
                  decoding="async"
                  fetchPriority="high"
                  width={96}
                  height={96}
                  onClick={handleClientLogoClicked}
                  className="size-12 rounded-full aspect-square object-cover"
                />
              )}
              {showCoffeeCounter && (
                <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-background/95 px-2 py-2 text-xs font-semibold text-neutral-400 shadow">
                  ☕ Kaw pozostało: {place.coffee_budget ?? 0}
                </span>
              )}
            </div>
            <h1
              className="text-xs text-left text-primary font-semibold"
              style={
                place.neon
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
          <div className="flex flex-col items-end gap-1 pt-1">
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
                  place.neon
                    ? {
                        animation: 'neon-logo-pulse 2.5s ease-in-out infinite',
                      }
                    : {}
                }
              />
            </div>
            {!preview && apiIsAdminQuery.isSuccess && (
              <AdminLink
                render={<Link to="/admin/place/$id" params={{ id: placeId }} />}
              />
            )}
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
            {preview ? (
              <Button size="sm" className="p-0" variant="ghost" disabled>
                <FaInstagram className="size-5" />
              </Button>
            ) : (
              <a
                href={place.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                  'p-0',
                )}
                onClick={handleInstagramButtonClicked}
              >
                <FaInstagram className="size-5" />
              </a>
            )}
            {preview ? (
              <Button size="sm" className="p-0" variant="ghost" disabled>
                <FaFacebook className="size-5" />
              </Button>
            ) : (
              <a
                href={place.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'sm' }),
                  'p-0',
                )}
                onClick={handleFacebookButtonClicked}
              >
                <FaFacebook className="size-5" />
              </a>
            )}
            <Button
              size="sm"
              className="p-0"
              variant="ghost"
              disabled={preview}
              onClick={handleShareButtonClicked}
            >
              <Share2Icon className="size-5" />
            </Button>
          </div>
        </div>
      </div>
      <Separator className="bg-primary -my-2 opacity-25" style={neonStyles} />
      <CarouselGallery images={galleryImages} />
      <Separator className="bg-primary -my-2 opacity-25" style={neonStyles} />
      <div>
        <p className="text-sm">
          <HighlightedText text={place.description} neon={place.neon} />
        </p>
      </div>
      <Separator className="bg-primary -my-2 opacity-25" style={neonStyles} />
      <p className="text-xs text-neutral-400 text-center">
        Podkręć suwak doświetlania w kamerze, to łatwy sposób na jeszcze
        piękniejsze zdjęcia!
      </p>
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
          style={{ ...neonStyles, borderWidth: '4px' }}
          onClick={handleCaptureImageButtonClicked}
          disabled={preview || selectedFiles.length >= 6}
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
              disabled={preview}
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
          disabled={preview || isUploadingDisabled}
          size="lg"
          onClick={handleUploadButtonClicked}
          className="h-12"
          style={
            place.neon && !isUploadingDisabled
              ? { ...neonStyles, borderWidth: '4px' }
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
        {selectedFiles.length > 0 && (
          <Button
            variant="secondary"
            size="lg"
            onClick={handleSharePicsButtonClicked}
            className="h-12"
            disabled={preview}
          >
            <Share2Icon />
            Udostępnij zdjęcia
          </Button>
        )}
      </div>
      <p className="text-xs text-neutral-400">
        Klikając przycisk „Wyślij", akceptujesz{' '}
        <Link to="/privacy-policy" className="underline hover:text-primary">
          Politykę prywatności
        </Link>{' '}
        i{' '}
        <Link to="/tos" className="underline hover:text-primary">
          Regulamin
        </Link>{' '}
        serwisu.
      </p>
      {!preview && <WalletBar />}
      <ThanksScreen
        visible={showThanksScreen}
        onVisibleChange={handleThanksVisibleChange}
        backgroundUri={place.background_url}
        backgroundOpacity={place.background_opacity}
        neon={place.neon}
        shareFiles={shareFiles}
        onInstagramShare={handleThanksInstagramShare}
        coffeeInfo={coffeeInfo}
        verifyingCoffee={verifyingCoffee}
        onGoogleSuccess={handleGoogleSuccess}
      />
    </Page>
  )
}
