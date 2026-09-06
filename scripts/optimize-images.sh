#!/usr/bin/env bash
# Optimizes all images for a place: assets-raw/places/<slug>/ -> public/places/<slug>/
# Usage: optimize-images.sh [slug ...]   (no args = all places)
set -euo pipefail

RAW="assets-raw/places"
OUT="public/places"

process_place() {
  local slug="$1"
  local src="$RAW/$slug"
  local dst="$OUT/$slug"

  [ -d "$src" ] || { echo "error: $src not found" >&2; exit 1; }
  mkdir -p "$dst"

  # Gallery: every file except background/logo/icon -> tile-STEM.webp + full-STEM.webp
  local f stem
  while IFS= read -r f; do
    stem="${f##*/}"; stem="${stem%%.*}"
    convert "$f" -auto-orient \
      -thumbnail 480x480^ -gravity center -extent 480x480 +repage \
      -quality 72 -strip "$dst/tile-$stem.webp"
    convert "$f" -auto-orient \
      -thumbnail 960x960^ -gravity center -extent 960x960 +repage \
      -quality 78 -strip "$dst/full-$stem.webp"
  done < <(find "$src" -maxdepth 1 -type f \
    ! -name 'background.*' ! -name 'logo.*' ! -name 'icon.*')

  # Background (any extension) -> background.webp
  f="$(find "$src" -maxdepth 1 -type f -name 'background.*' -print -quit || true)"
  if [ -n "$f" ]; then
    convert "$f" -auto-orient -strip -quality 55 "$dst/background.webp"
  fi

  # Logo (any extension) -> logo-96.webp  (matches /places/<id>/logo-96.webp in the route)
  f="$(find "$src" -maxdepth 1 -type f -name 'logo.*' -print -quit || true)"
  if [ -n "$f" ]; then
    convert "$f" -auto-orient -resize 96x96 -strip -quality 80 "$dst/logo-96.webp"
  fi

  # App icon is global — only place "1" owns it
  f="$(find "$src" -maxdepth 1 -type f -name 'icon.*' -print -quit || true)"
  if [ -n "$f" ] && [ "$slug" = "1" ]; then
    convert "$f" -resize 96x96 -strip -define png:compression-level=9 "public/icon-96.png"
  fi

  echo "ok: $slug -> $dst"
}

if [ "$#" -eq 0 ]; then
  for d in "$RAW"/*/; do process_place "$(basename "$d")"; done
else
  for slug in "$@"; do process_place "$slug"; done
fi
