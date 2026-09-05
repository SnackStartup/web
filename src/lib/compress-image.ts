const MAX_DIMENSION = 1600
const JPEG_QUALITY = 0.82

export async function compressImage(file: File): Promise<File> {
  const isBitmapImage =
    file.type.startsWith('image/') &&
    file.type !== 'image/svg+xml' &&
    file.type !== 'image/gif'
  if (!isBitmapImage) return file

  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(
      1,
      MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
    )
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) {
      bitmap.close()
      return file
    }

    context.fillStyle = 'white' // handle PNG transparency -> white bg
    context.fillRect(0, 0, width, height)
    context.drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
    )
    if (!blob || blob.size >= file.size) return file // keep if already small

    const baseName = file.name.replace(/\.[^.]+$/, '').trim() || 'photo'
    return new File([blob], `${baseName}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now(),
    })
  } catch {
    return file // HEIC etc. that canvas can't decode -> original
  }
}
