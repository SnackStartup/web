import { Page } from '#/components/Page'
import { Button } from '#/components/ui/button'
import { Skeleton } from '#/components/ui/skeleton'
import { createFileRoute } from '@tanstack/react-router'
import {
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ChangeEventHandler,
} from 'react'
import { FaLocationDot, FaCamera, FaImage } from 'react-icons/fa6'
import Webcam from 'react-webcam'
import { FileUploadGallery } from '#/components/file-upload-gallery'
import { Field } from '#/components/ui/field'
import { Checkbox } from '#/components/ui/checkbox'
import { Label } from '#/components/ui/label'
import { useWindowSize } from '#/hooks/use-window-size'
import { useApiUploadPhotosMutation } from '#/api/useApiUploadPhotosMutation'

export const Route = createFileRoute('/scanned')({
  component: RouteComponent,
})

function RouteComponent() {
  const [isCapturingImage, setIsCapturingImage] = useState<boolean>(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const webcamRef = useRef<Webcam>(null)
  const inputFileRef = useRef<HTMLInputElement>(null)
  const windowSize = useWindowSize()
  const apiUploadPhotosMutation = useApiUploadPhotosMutation()

  const cameraVideoConstraints = useMemo<MediaTrackConstraints>(
    () => ({
      facingMode: {
        exact: import.meta.env.DEV ? 'user' : 'environment',
      },
      aspectRatio: windowSize.height / windowSize.width,
    }),
    [windowSize],
  )

  /*
   *
   * Handlers
   *
   */

  const handleCaptureImageButtonClicked = () => {
    setIsCapturingImage(true)
  }

  const handleConfirmCaptureImageButtonClicked = async () => {
    if (webcamRef.current) {
      const base64 = webcamRef.current.getScreenshot()
      if (typeof base64 === 'string') {
        const data = await fetch(base64)
        const blob = await data.blob()
        const file = await new File([blob], 'avatar', { type: 'image/png' })
        setSelectedFiles((files) => [...files, file])
      }
    }
    setIsCapturingImage(false)
  }

  const handleSelectImageButtonClicked = () => {
    inputFileRef.current?.click()
  }

  const handleFileChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFiles((files) => [...files, file])
    }
  }

  const handleUploadButtonClicked = () => {
    apiUploadPhotosMutation.mutate({ files: selectedFiles })
  }

  /*
   *
   *
   *
   */

  return (
    <Page className="flex flex-col gap-6 h-full">
      <div className="flex flex-col gap-2">
        <div className="flex flex-row gap-2 items-center">
          <Skeleton className="size-18 rounded-full aspect-square" />
          <div>
            <h1 className="font-bold text-2xl">Cat cafe</h1>
            <p className="text-neutral-500">
              Cat cafe description lorem ipsum lorem ipsum lorem ipsum
            </p>
          </div>
        </div>
        <div className="flex flex-row gap-2">
          <FaLocationDot className="size-5" />
          <p className="text-nowrap text-ellipsis overflow-hidden">
            Bydgoszcz, Michała Kleofasa Ogińskiego 4
          </p>
        </div>
      </div>
      <div>
        <h2 className="font-semibold">Zrób zdjęcie swojego dania</h2>
        <p>
          Pomożesz nam pokazać, jak wygląda jedzenie u nas, a Ty dostaniesz
          lepsze zdjęcie na swój telefon.
        </p>
      </div>
      <Button
        className="h-20 text-xl w-full"
        onClick={handleCaptureImageButtonClicked}
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
      <Field orientation="horizontal">
        <Checkbox id="terms-checkbox" name="terms-checkbox" defaultChecked />
        <Label htmlFor="terms-checkbox">
          Zgadzam się, żeby restauracja mogła wykorzystać to zdjęcie w swoich
          mediach społecznościowych
        </Label>
      </Field>
      <Button
        disabled={selectedFiles.length === 0}
        size="lg"
        onClick={handleUploadButtonClicked}
      >
        Wyślij
      </Button>
      {isCapturingImage && (
        <>
          <Webcam
            audio={false}
            className="absolute left-0 top-0 z-20 translate-y-1/2"
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            height={windowSize.height}
            width={windowSize.width}
            videoConstraints={cameraVideoConstraints}
            forceScreenshotSourceSize={true}
          />
          <Button
            className="rounded-full aspect-square size-16 z-30 absolute bottom-4 left-1/2 -translate-x-1/2 text-black bg-white"
            onClick={handleConfirmCaptureImageButtonClicked}
          >
            <FaCamera className="size-7" />
          </Button>
          <div className="absolute left-0 top-0 h-screen w-screen bg-black z-10" />
        </>
      )}
    </Page>
  )
}
