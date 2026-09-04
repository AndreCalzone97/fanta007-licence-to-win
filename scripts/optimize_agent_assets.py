from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


ASSETS = (
    ("ChatGPT Image 3 set 2026, 10_59_26.png", "brand", (360, 720)),
    ("ChatGPT Image 3 set 2026, 10_59_43.png", "hero", (480, 760)),
    ("ChatGPT Image 3 set 2026, 10_59_49.png", "thinking", (240, 480)),
    ("ChatGPT Image 3 set 2026, 10_59_55.png", "positive", (240, 480)),
    ("ChatGPT Image 3 set 2026, 10_59_59.png", "warning", (240, 480)),
    ("ChatGPT Image 3 set 2026, 11_00_06.png", "critical", (240, 480)),
    ("ChatGPT Image 3 set 2026, 11_00_09.png", "success", (320, 640)),
    ("ChatGPT Image 3 set 2026, 11_00_13.png", "scouting", (320, 640)),
    ("ChatGPT Image 3 set 2026, 11_00_18.png", "verdict", (320, 640)),
)


def convert(source_dir: Path, output_dir: Path) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    for source_name, semantic_name, widths in ASSETS:
        source = source_dir / source_name
        if not source.exists():
            raise FileNotFoundError(f"Asset mancante: {source}")

        with Image.open(source) as original:
            rgba = original.convert("RGBA")
            for width in widths:
                height = round(rgba.height * width / rgba.width)
                resized = rgba.resize((width, height), Image.Resampling.LANCZOS)
                destination = output_dir / f"agent-{semantic_name}-{width}.webp"
                resized.save(destination, "WEBP", quality=80, method=6, exact=True)
                print(f"{destination.name}: {width}x{height} · {destination.stat().st_size} bytes")


def main() -> None:
    parser = argparse.ArgumentParser(description="Ottimizza gli asset illustrati di Fanta007.")
    parser.add_argument("source", type=Path, help="Cartella contenente i PNG originali")
    parser.add_argument("output", type=Path, help="Cartella di destinazione WebP")
    args = parser.parse_args()
    convert(args.source, args.output)


if __name__ == "__main__":
    main()
