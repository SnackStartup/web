import { readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export function generateGalleryManifest() {
  const out = {}
  for (const entry of readdirSync('public/places', { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const tiles = readdirSync(join('public/places', entry.name)).filter((f) =>
      /^tile-\d+\.webp$/.test(f),
    ).length
    if (tiles > 0) out[entry.name] = tiles
  }
  writeFileSync(
    'public/gallery-manifest.json',
    `${JSON.stringify(out, null, 2)}\n`,
  )
  return out
}
