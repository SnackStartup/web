import { useWindowSize } from '#/hooks/use-window-size'
import { useEffect, useMemo, useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { Button } from './ui/button'
import { FaCamera, FaXmark } from 'react-icons/fa6'

type Props = {
  onDeactivate: (file?: File) => void
}

const cameraVideoConstraints: MediaTrackConstraints = {
  facingMode: {
    // ideal: import.meta.env.DEV ? 'user' : 'environment',
    ideal: 'environment',
  },
}

export const ImageCapture: React.FC<Props> = ({ onDeactivate }) => {
  const webcamRef = useRef<Webcam>(null)
  const windowSize = useWindowSize()

  // Lock scroll/zoom while capturing
  useEffect(() => {
    const root = document.documentElement
    const prevTouchAction = root.style.touchAction
    const prevOverflow = document.body.style.overflow
    const prevPosition = document.body.style.position

    root.style.touchAction = 'none' // no pan/pinch zoom
    document.body.style.overflow = 'hidden' // no scroll
    document.body.style.position = 'fixed'
    document.body.style.insetInline = '0'

    return () => {
      root.style.touchAction = prevTouchAction
      document.body.style.overflow = prevOverflow
      document.body.style.position = prevPosition
      document.body.style.insetInline = ''
    }
  }, [])

  const handleCaptureButtonClicked = async () => {
    if (!webcamRef.current) {
      onDeactivate()
      return
    }
    const base64 = webcamRef.current.getScreenshot()
    if (typeof base64 !== 'string') {
      onDeactivate()
      return
    }

    const data = await fetch(base64)
    const blob = await data.blob()
    const file = await new File([blob], `dish-${Date.now()}.jpg`, {
      type: 'image/jpeg',
    })
    onDeactivate(file)
  }

  return (
    <div className="fixed inset-0 z-10 bg-black">
      <Webcam
        audio={false}
        className="absolute left-0 top-16 z-20"
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        height={windowSize.height}
        width={windowSize.width}
        videoConstraints={cameraVideoConstraints}
        forceScreenshotSourceSize={true}
        onUserMediaError={console.error}
      />
      <Button
        className="rounded-full aspect-square size-16 z-30 absolute bottom-4 left-1/2 -translate-x-1/2 text-black bg-white"
        onClick={handleCaptureButtonClicked}
      >
        <FaCamera className="size-7" />
      </Button>
      <Button
        variant="ghost"
        className="absolute top-2 left-2 z-40 size-12 rounded-full bg-black/50 text-white"
        onClick={() => onDeactivate()}
      >
        <FaXmark className="size-6" />
      </Button>
    </div>
  )
}
