const MAX_DIMENSION = 1280
const JPEG_QUALITY = 0.72

async function drawToJpeg(
  draw: (ctx: CanvasRenderingContext2D, width: number, height: number) => void,
  width: number,
  height: number,
): Promise<Blob | null> {
  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height))
  const w = Math.max(1, Math.round(width * scale))
  const h = Math.max(1, Math.round(height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = 'white' // PNG/HEIC transparency -> white bg
  ctx.fillRect(0, 0, w, h)
  draw(ctx, w, h)
  return new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
  )
}

function toJpegFile(blob: Blob, original: File): File {
  const baseName = original.name.replace(/\.[^.]+$/, '').trim() || 'photo'
  return new File([blob], `${baseName}.jpg`, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  })
}

export async function compressImage(file: File): Promise<File> {
  const isBitmapImage =
    file.type.startsWith('image/') &&
    file.type !== 'image/svg+xml' &&
    file.type !== 'image/gif'
  if (!isBitmapImage) return file

  try {
    // Fast path: createImageBitmap
    const bitmap = await createImageBitmap(file)
    const { width, height } = bitmap
    const blob = await drawToJpeg(
      (ctx, w, h) => ctx.drawImage(bitmap, 0, 0, w, h),
      width,
      height,
    )
    bitmap.close()
    if (!blob || blob.size >= file.size) return file
    return toJpegFile(blob, file)
  } catch {
    // HEIC path: createImageBitmap can't decode it, but <img> can (Safari/Chrome)
    const url = URL.createObjectURL(file)
    try {
      const img = new Image()
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => reject(new Error('decode failed'))
        img.src = url
      })
      const { naturalWidth: width, naturalHeight: height } = img
      if (!width || !height) return file
      const blob = await drawToJpeg(
        (ctx, w, h) => ctx.drawImage(img, 0, 0, w, h),
        width,
        height,
      )
      if (!blob || blob.size >= file.size) return file
      return toJpegFile(blob, file)
    } catch {
      return file // truly undecodable -> send original
    } finally {
      URL.revokeObjectURL(url)
    }
  }
}
