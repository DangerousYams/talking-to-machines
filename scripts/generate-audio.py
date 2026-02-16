"""
Generate per-paragraph MP3 audio for each chapter using Edge TTS.

Prerequisites:
    pip3 install beautifulsoup4 edge-tts

Usage:
    npm run build          # must build first so dist/client/ has HTML
    python3 scripts/generate-audio.py           # all chapters
    python3 scripts/generate-audio.py ch1 ch3   # specific chapters only

Output:
    public/audio/ch{N}/{000..NNN}.mp3
    public/audio/manifest.json

The paragraph extraction selectors match ListenController.tsx exactly so
paragraph indices stay aligned between the manifest and the DOM at runtime.
"""

import asyncio
import json
import os
import re
import sys
from pathlib import Path

from bs4 import BeautifulSoup

# Lazy import — edge_tts is async-only
import edge_tts

# ─── Config ───────────────────────────────────────────────────────────
VOICE = "en-US-AndrewMultilingualNeural"
DIST_DIR = Path("dist/client")
AUDIO_DIR = Path("public/audio")
CHAPTERS = [f"ch{i}" for i in range(1, 12)]


def extract_paragraphs(html_path: Path) -> list[str]:
    """
    Extract readable paragraphs from a built chapter HTML file.
    Selectors mirror ListenController.tsx's collectParagraphs():
      - section with class containing 'max-w-[680px]' → p, h2, h3
      - section with class containing 'min-h-[80vh]'  → h1, p
      - elements with class 'pull-quote'
    """
    with open(html_path, encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    elements: list = []

    # Narrow narrative sections
    for sec in soup.find_all(
        "section", class_=lambda c: c and "max-w-[680px]" in c
    ):
        elements.extend(sec.find_all(["p", "h2", "h3"]))

    # Hero / full-height sections
    for sec in soup.find_all(
        "section", class_=lambda c: c and "min-h-[80vh]" in c
    ):
        elements.extend(sec.find_all(["h1", "p"]))

    # Pull quotes
    elements.extend(
        soup.find_all(class_=lambda c: c and "pull-quote" in c)
    )

    # Deduplicate preserving first occurrence
    seen: set[int] = set()
    unique: list = []
    for el in elements:
        eid = id(el)
        if eid not in seen:
            seen.add(eid)
            unique.append(el)

    # Sort by document order
    unique.sort(key=lambda el: el.sourceline or 0)

    # Extract text, clean up whitespace, filter short strings
    result: list[str] = []
    for el in unique:
        text = el.get_text(separator=" ", strip=True)
        text = re.sub(r"\s+", " ", text)
        if len(text) > 5:
            result.append(text)

    return result


async def generate_chapter_audio(
    slug: str, paragraphs: list[str], force: bool = False
) -> int:
    """Generate MP3 files for each paragraph. Returns count generated."""
    out_dir = AUDIO_DIR / slug
    out_dir.mkdir(parents=True, exist_ok=True)

    generated = 0
    for i, text in enumerate(paragraphs):
        mp3_path = out_dir / f"{i:03d}.mp3"
        if mp3_path.exists() and not force:
            continue
        for attempt in range(3):
            try:
                tts = edge_tts.Communicate(text, VOICE)
                await tts.save(str(mp3_path))
                generated += 1
                print(f"  {mp3_path}")
                break
            except Exception as e:
                if attempt < 2:
                    wait = 5 * (attempt + 1)
                    print(f"  RETRY {mp3_path} in {wait}s ({e})")
                    await asyncio.sleep(wait)
                else:
                    print(f"  FAILED {mp3_path}: {e}")
        # Small delay to avoid rate limiting
        await asyncio.sleep(0.3)

    return generated


async def main():
    # Determine which chapters to process
    if len(sys.argv) > 1:
        targets = sys.argv[1:]
        # Validate
        for t in targets:
            if t not in CHAPTERS:
                print(f"Unknown chapter: {t}  (expected ch1..ch11)")
                sys.exit(1)
    else:
        targets = CHAPTERS

    if not DIST_DIR.exists():
        print(f"ERROR: {DIST_DIR} not found. Run 'npm run build' first.")
        sys.exit(1)

    manifest: dict[str, int] = {}

    # Load existing manifest if present
    manifest_path = AUDIO_DIR / "manifest.json"
    if manifest_path.exists():
        with open(manifest_path) as f:
            manifest = json.load(f)

    for slug in targets:
        html_path = DIST_DIR / slug / "index.html"
        if not html_path.exists():
            print(f"  SKIP {slug} — no built HTML at {html_path}")
            continue

        paragraphs = extract_paragraphs(html_path)
        print(f"\n{slug}: {len(paragraphs)} paragraphs")

        generated = await generate_chapter_audio(slug, paragraphs)
        manifest[slug] = len(paragraphs)

        if generated == 0:
            print(f"  (all files already exist, skipped)")
        else:
            print(f"  Generated {generated} new file(s)")

    # Write manifest
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    with open(manifest_path, "w") as f:
        json.dump(manifest, f, indent=2)
    print(f"\nManifest written: {manifest_path}")
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    asyncio.run(main())
