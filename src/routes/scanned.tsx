import { Page } from '#/components/Page'
import { Button } from '#/components/ui/button'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import type { ChangeEventHandler } from 'react'
import { FaLocationDot, FaCamera, FaImage } from 'react-icons/fa6'
import { FileUploadGallery } from '#/components/file-upload-gallery'
import { Rating, RatingItem } from '#/components/ui/rating'
import { HeartIcon, StarIcon } from 'lucide-react'
import { useApiUploadPhotosMutation } from '#/api/useApiUploadPhotosMutation'
import { ThanksScreen } from '#/components/ThanksScreen'

export const Route = createFileRoute('/scanned')({
  component: RouteComponent,
})

function RouteComponent() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const inputFileRef = useRef<HTMLInputElement>(null)
  const apiUploadPhotosMutation = useApiUploadPhotosMutation()
  const navigate = useNavigate()
  const imageCaptureInputRef = useRef<HTMLInputElement>(null)
  const [showThanksScreen, setShowThanksScreen] = useState<boolean>(false)

  useEffect(() => {
    console.log('MOUNT')

    return () => {
      console.log('UNMOUNT')
    }
  }, [])

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
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFiles((files) => [...files, file])
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
          navigate({ to: '/scanned' })
        },
      },
    )
  }

  /*
   *
   *
   *
   */

  return (
    <Page className="flex flex-col gap-6 h-full">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row gap-2 items-center">
          <img src="/icon.png" className="size-10" />
          <h1 className="font-bold text-xl text-primary">Stolik</h1>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <h1 className="font-bold text-md">Cat cafe</h1>
          <img
            src="/coffee.jpg"
            className="size-12 rounded-full aspect-square object-cover"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2">
          <FaLocationDot className="size-5" />
          <p className="text-nowrap text-ellipsis overflow-hidden">
            Michała Kleofasa Ogińskiego 4, Bydgoszcz
          </p>
        </div>
        <Rating defaultValue={4} className="gap-1 text-amber-500">
          {Array.from({ length: 5 }, (_, i) => (
            <RatingItem key={i} className="pointer-events-none">
              <StarIcon />
            </RatingItem>
          ))}
        </Rating>
      </div>
      <div>
        <p className="text-neutral-400">
          Zrób zdjęcie swojego dania! Pomożesz nam pokazać, jak wygląda jedzenie
          u nas, a Ty dostaniesz lepsze zdjęcie na swój telefon.
        </p>
      </div>
      <input
        ref={imageCaptureInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={handleFileChange}
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
      <div className="flex-1" />
      <Button
        disabled={selectedFiles.length === 0}
        size="lg"
        onClick={handleUploadButtonClicked}
      >
        Wyślij
      </Button>
      <p className="text-xs text-neutral-400">
        Klikając przycisk „Wyślij", wyrażasz zgodę na wykorzystanie tego zdjęcia
        przez restaurację w jej mediach społecznościowych.
      </p>
      <ThanksScreen
        visible={showThanksScreen}
        onVisibleChange={setShowThanksScreen}
      />
    </Page>
  )
}
