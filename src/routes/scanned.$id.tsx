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
import { CarouselGallery } from '#/components/carousel-gallery'
import { usePostHog } from '@posthog/react'
import { Separator } from '#/components/ui/separator'
import { Spinner } from '#/components/ui/spinner'

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
  const posthog = usePostHog()
  const isUploading = apiUploadPhotosMutation.isPending

  const IMAGES: string[] = [
    // '/catcafe/1.jpg',
    // '/catcafe/2.jpg',
    // '/catcafe/3.jpg',
    // '/catcafe/4.jpg',
    // '/catcafe/5.jpg',
    '/catcafe/6.jpg',
    '/catcafe/7.jpg',
    '/catcafe/8.jpg',
    '/catcafe/9.jpg',
    '/catcafe/10.jpg',
    '/catcafe/11.jpg',
    '/catcafe/12.jpg',
    '/catcafe/13.jpg',
  ]

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
    apiUploadPhotosMutation.mutate(
      { files: selectedFiles },
      {
        onSuccess() {
          setSelectedFiles([])
          setShowThanksScreen(true)
        },
        onError(error) {
          console.error(error)
          navigate({ to: '/scanned/$id', params: { id: '1' } })
        },
      },
    )
  }

  const handleShareButtonClicked = async () => {
    posthog.capture('shared_page')
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
    posthog.capture('facebook_clicked')
  }

  const handleInstagramButtonClicked = async () => {
    posthog.capture('instagram_clicked')
  }

  const handleSharePicsButtonClicked = async () => {
    posthog.capture('shared_pics', {
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
    posthog.capture('rating_clicked')
  }

  /*
   *
   *
   *
   */

  return (
    <Page className="flex flex-col gap-6 h-full relative overflow-hidden">
      <img
        src="/catcafe/background.png"
        className="absolute inset-0 w-full h-full object-cover -z-10"
        alt=""
      />
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-row gap-2 items-center">
            <img
              src="/catcafe/logo.jpg"
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
            <img src="/icon.png" className="size-10" />
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
      <div className="flex flex-col gap-2">
        <Button
          disabled={selectedFiles.length === 0 || isUploading}
          size="lg"
          onClick={handleUploadButtonClicked}
          className="h-12"
        >
          {isUploading && <Spinner data-icon="inline-start" />}
          {isUploading ? 'Wysyłanie' : 'Wyślij'}
        </Button>
        {canSharePics && selectedFiles.length > 0 && (
          <Button
            variant="secondary"
            size="lg"
            onClick={handleSharePicsButtonClicked}
            className="h-12"
          >
            <Share2Icon />
            Udostępnij zdjęcia
          </Button>
        )}
      </div>
      <ThanksScreen
        visible={showThanksScreen}
        onVisibleChange={setShowThanksScreen}
      />
    </Page>
  )
}
