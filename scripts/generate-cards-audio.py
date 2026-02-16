"""
Generate per-segment MP3 audio for the cards version of each chapter using Edge TTS.

Prerequisites:
    pip3 install edge-tts

Usage:
    python3 scripts/generate-cards-audio.py           # all chapters
    python3 scripts/generate-cards-audio.py ch1 ch3   # specific chapters only
    python3 scripts/generate-cards-audio.py --force    # regenerate all files

Output:
    public/audio/cards/ch{N}/{000..NNN}.mp3
    public/audio/cards/manifest.json

Reads text segments from src/data/cards-audio-text.json (one entry per audioIndex).
"""

import asyncio
import json
import sys
from pathlib import Path

import edge_tts

# ─── Config ───────────────────────────────────────────────────────────
VOICE = "en-US-AndrewMultilingualNeural"
TEXT_SOURCE = Path("src/data/cards-audio-text.json")
AUDIO_DIR = Path("public/audio/cards")
CHAPTERS = [f"ch{i}" for i in range(1, 12)]


async def generate_chapter_audio(
    slug: str, segments: list[str], force: bool = False
) -> int:
    """Generate MP3 files for each text segment. Returns count generated."""
    out_dir = AUDIO_DIR / slug
    out_dir.mkdir(parents=True, exist_ok=True)

    generated = 0
    for i, text in enumerate(segments):
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
    force = "--force" in sys.argv
    args = [a for a in sys.argv[1:] if a != "--force"]

    # Determine which chapters to process
    if args:
        targets = args
        for t in targets:
            if t not in CHAPTERS:
                print(f"Unknown chapter: {t}  (expected ch1..ch11)")
                sys.exit(1)
    else:
        targets = CHAPTERS

    if not TEXT_SOURCE.exists():
        print(f"ERROR: {TEXT_SOURCE} not found.")
        sys.exit(1)

    with open(TEXT_SOURCE, encoding="utf-8") as f:
        all_text: dict[str, list[str]] = json.load(f)

    manifest: dict[str, int] = {}

    # Load existing manifest if present
    manifest_path = AUDIO_DIR / "manifest.json"
    if manifest_path.exists():
        with open(manifest_path) as f:
            manifest = json.load(f)

    for slug in targets:
        segments = all_text.get(slug)
        if not segments:
            print(f"  SKIP {slug} — no text data in {TEXT_SOURCE}")
            continue

        print(f"\n{slug}: {len(segments)} segments")

        generated = await generate_chapter_audio(slug, segments, force=force)
        manifest[slug] = len(segments)

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
