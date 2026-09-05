#!/usr/bin/env bash
# Generates optimized WebP/JPEG variants from originals in assets-raw/
# Requires ImageMagick with libwebp (convert --version shows WEBP). Idempotent.
set -euo pipefail

RAW="assets-raw"
OUT="public/catcafe"

mkdir -p "$OUT"

# Carousel: 480px tile + 960px lightbox (square center-crop, matches aspect-square grid)
for n in 6 7 8 9 10 11 12 13; do
  convert "$RAW/$n.jpg" -auto-orient \
    -thumbnail 480x480 -gravity center -extent 480x480 \
    -quality 72 -strip "$OUT/tile-$n.webp"
  convert "$RAW/$n.jpg" -auto-orient \
    -thumbnail 960x960 -gravity center -extent 960x960 \
    -quality 78 -strip "$OUT/full-$n.webp"
done

# Decorative dimmed backdrop -> small + low quality is invisible
convert "$RAW/background.png" -auto-orient -strip -quality 55 "$OUT/background.webp"

# Logo displayed at 48px -> 96px source is plenty
convert "$RAW/logo.jpg" -auto-orient -resize 96x96 -strip -quality 80 "$OUT/logo-96.jpg"

# Favicon / in-page icon (24-56px) -> 96px PNG
convert "$RAW/icon.png" -resize 96x96 -strip -define png:compression-level=9 "public/icon-96.png"
