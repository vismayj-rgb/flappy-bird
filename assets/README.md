# Assets Directory

This directory contains all game assets including images, sounds, and other media files.

## Directory Structure

```
assets/
├── images/          # Game sprites and images
│   ├── bird.png     # Bird sprite (recommended: 34x24px)
│   ├── pipe.png     # Pipe sprite
│   ├── background.png
│   └── favicon.png  # Browser favicon
├── sounds/          # Sound effects
│   ├── jump.wav     # Jump/flap sound
│   ├── score.wav    # Score point sound
│   ├── hit.wav      # Collision sound
│   └── gameover.wav # Game over sound
└── fonts/           # Custom fonts (if any)
```

## Adding Custom Assets

### Images
- Place custom images in the `images/` folder
- Update references in the game code to use your images
- Recommended formats: PNG (with transparency), SVG
- Keep file sizes small for faster loading

### Sounds
- Place audio files in the `sounds/` folder
- Supported formats: MP3, WAV, OGG
- Keep sound effects short (< 2 seconds) for better UX
- Normalize volume levels for consistency

### Usage in Code
To use custom assets, modify the appropriate files:
- Images: Update `src/entities/bird.js`, `src/entities/pipe.js`
- Sounds: Update `src/utils/sound.js`

## Current Implementation

The game currently uses:
- **Procedurally generated graphics** (Canvas 2D drawing)
- **Web Audio API** for synthesized sounds

You can replace these with custom assets for a more polished look and feel.

## Asset Attribution

If using third-party assets, make sure to:
1. Check the license terms
2. Provide proper attribution
3. Add credits to the main README.md

## Optimization Tips

- Compress images using tools like TinyPNG
- Use sprite sheets for multiple images
- Lazy load non-critical assets
- Use appropriate image dimensions (no need for 4K sprites!)
