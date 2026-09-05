import { Page } from '#/components/Page'
import { Button } from '#/components/ui/button'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import type { ChangeEventHandler } from 'react'
import {
  FaLocationDot,
  FaCamera,
  FaImage,
  FaFacebook,
  FaInstagram,
  FaAppStoreIos,
} from 'react-icons/fa6'
import { FileUploadGallery } from '#/components/file-upload-gallery'
import { Rating, RatingItem } from '#/components/ui/rating'
import { HeartIcon, Share2Icon, ShareIcon, StarIcon } from 'lucide-react'
import { useApiUploadPhotosMutation } from '#/api/useApiUploadPhotosMutation'
import { ThanksScreen } from '#/components/ThanksScreen'
import {
  CarouselGallery,
  type GalleryImage,
} from '#/components/carousel-gallery'
import { Separator } from '#/components/ui/separator'
import { Spinner } from '#/components/ui/spinner'
import { analyticsCapture } from '#/lib/analytics'

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

  const IMAGES: GalleryImage[] = Array.from({ length: 8 }, (_, i) => {
    const id = i + 6
    return {
      tile: `/catcafe/tile-${id}.webp`,
      full: `/catcafe/full-${id}.webp`,
    }
  })

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
      { files: selectedFiles },
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
    analyticsCapture('shared_page')
    const shareData = {
      title: 'Stolik — Pod Kocim Ogonem',
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
    analyticsCapture('facebook_clicked')
  }

  const handleInstagramButtonClicked = async () => {
    analyticsCapture('instagram_clicked')
  }

  const handleSharePicsButtonClicked = async () => {
    analyticsCapture('shared_pics', {
      files: selectedFiles.map((file) => file.name),
    })
    if (canSharePics) {
      await navigator.share({
        title: 'Stolik — Pod Kocim Ogonem',
        files: selectedFiles,
      })
    }
  }

  const handleRatingClicked = () => {
    analyticsCapture('rating_clicked')
  }

  /*
   *
   *
   *
   */

  return (
    <Page className="flex flex-col gap-6 h-full relative overflow-hidden">
      <img
        src="/catcafe/background.webp"
        className="absolute inset-0 w-full h-full object-cover -z-10"
        decoding="async"
        fetchPriority="low"
        alt=""
      />
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row gap-2 items-center">
            <img
              src="/catcafe/logo-96.jpg"
              decoding="async"
              fetchPriority="high"
              width={96}
              height={96}
              className="size-12 rounded-full aspect-square object-cover"
            />
            <h1 className="text-xs text-left text-primary">
              Klubokawiarnia
              <br />
              „Pod Kocim Ogonem"
            </h1>
          </div>
          <div
            className="flex flex-row gap-1 items-center"
            onClick={() => navigate({ to: '/' })}
          >
            <h1 className="font-bold text-xl">Stolik</h1>
            <img src="/icon-96.png" decoding="async" className="size-10" />
          </div>
        </div>
        <div className="flex flex-row gap-2">
          <FaLocationDot className="size-5" />
          <p>Bydgoszcz, ul. Długa 36</p>
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
                  href="https://www.instagram.com/podkocimogonem?igsi=MTZhdTdjbnI0dmQ2Ng=="
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
                  href="https://www.facebook.com/profile.php?id=61589769376486"
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
      <Separator className="bg-primary -my-2 opacity-25" />
      <CarouselGallery images={IMAGES} />
      <Separator className="bg-primary -my-2 opacity-25" />
      <div>
        <p className="text-sm">
          Uchwyciłeś pyszne danie,{' '}
          <span className="text-primary">uroczy moment z kotem</span> albo
          świetną chwilę u nas? Podziel się zdjęciami! Pomóż innym odkryć nasz
          klimat, a{' '}
          <span className="text-primary">
            najpiękniejsze kadry znajdziesz na naszym profilu!
          </span>
        </p>
      </div>
      <Separator className="bg-primary -my-2 opacity-25" />
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
          disabled={selectedFiles.length === 0 || isUploading}
          size="lg"
          onClick={handleUploadButtonClicked}
          className="h-12"
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
      />
    </Page>
  )
}
