"""Rasteryzuje brandowy SVG na PNG-i używane przez apkę i Google Wallet.

Wymaga: chrome-headless-shell (z Playwrighta) + Pillow.

Użycie:
    python3 scripts/render-logo.py "$HOME/Downloads/stolik-icon-yellow-star (2).svg"

Tworzy w public/:
    logo.svg          - wektor (do <img> i faviconu)
    icon-96.png       - ikona w UI
    icon-192.png      - PWA / Android
    icon-512.png      - PWA / Android
    wallet-logo.png   - 660x660, treść 70% (bezpieczna strefa maski kołowej Google)
"""

import glob
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image

PUBLIC = Path(__file__).resolve().parent.parent / "public"
TMP = Path("/tmp/stolik-logo-render")
WRAPPER = Path("/tmp/stolik-logo-render/wrap.html")

CANVAS = 660
WALLET_CONTENT_RATIO = 0.70


def find_chrome() -> str:
    pattern = str(
        Path.home()
        / ".cache/ms-playwright/chromium_headless_shell-*/"
        "chrome-headless-shell-linux64/chrome-headless-shell"
    )
    found = sorted(glob.glob(pattern))
    if not found:
        sys.exit("Nie znalazłem chrome-headless-shell (zainstaluj Playwrighta).")
    return found[0]


def render(size: int) -> Image.Image:
    """Renderuje logo.svg do kwadratu `size` x `size` z przezroczystym tłem."""
    TMP.mkdir(parents=True, exist_ok=True)
    WRAPPER.write_text(
        "<!doctype html><html><head><style>"
        "html,body{margin:0;padding:0;background:transparent;overflow:hidden}"
        f"img{{display:block;width:{size}px;height:{size}px}}"
        "</style></head><body><img src='logo.svg'></body></html>"
    )
    out = TMP / f"render-{size}.png"
    subprocess.run(
        [
            find_chrome(),
            "--no-sandbox",
            "--disable-gpu",
            "--hide-scrollbars",
            "--default-background-color=00000000",
            f"--window-size={size},{size}",
            f"--screenshot={out}",
            f"file://{WRAPPER}",
        ],
        check=True,
        capture_output=True,
    )
    return Image.open(out).convert("RGBA")


def write(img: Image.Image, name: str, size: int) -> None:
    img.resize((size, size), Image.LANCZOS).save(PUBLIC / name, optimize=True)
    print(f"{name:22s} {size}x{size}")


def main() -> int:
    if len(sys.argv) != 2:
        return int(bool(sys.stderr.write(__doc__ or "")) or 2)

    src = Path(sys.argv[1]).expanduser()
    if not src.is_file():
        sys.exit(f"Nie ma pliku: {src}")

    TMP.mkdir(parents=True, exist_ok=True)
    shutil.copy(src, TMP / "logo.svg")
    shutil.copy(src, PUBLIC / "logo.svg")
    print("logo.svg               (wektor, do <img> i favicon)")

    full = render(1024)
    for size in (96, 192, 512):
        write(full, f"icon-{size}.png", size)

    # Logo dla Google Wallet: maska kołowa + 15% marginesu, więc pomniejszamy treść.
    inner = int(CANVAS * WALLET_CONTENT_RATIO)
    canvas = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    offset = (CANVAS - inner) // 2
    canvas.alpha_composite(full.resize((inner, inner), Image.LANCZOS), (offset, offset))
    canvas.save(PUBLIC / "wallet-logo.png", optimize=True)
    print(f"{'wallet-logo.png':22s} {CANVAS}x{CANVAS} (treść {inner}px pod maskę)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
