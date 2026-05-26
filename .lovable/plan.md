# Background Music on Score Keeper Page

Add subtle ambient background music to `/score` using the uploaded MP3, with a small SVG sound toggle pinned at the bottom of the page.

## What gets built

1. **Asset** — copy `user-uploads://videoplayback.mp3` to `public/audio/scorekeeper-ambient.mp3` so it streams directly from the site root.

2. **`src/components/MusicPlayer.tsx`** (new)
   - Native HTML `<audio>` element, `loop`, `preload="auto"`, `volume = 0.15` (subtle).
   - Starts **paused** (browsers block autoplay-with-sound). First tap of the toggle starts playback; the choice is persisted in `localStorage` so return visits auto-resume.
   - Fixed-position toggle button at bottom-center (`fixed bottom-4 left-1/2 -translate-x-1/2 z-50`), above the footer area, styled with semantic tokens (`bg-background/80 backdrop-blur border border-primary/40 text-primary`).
   - Two inline SVG icons: speaker-with-waves (on) / speaker-with-slash (off). Smooth swap via conditional render.
   - Cleans up audio on unmount.

3. **`src/pages/Score.tsx`** — mount `<MusicPlayer />` so music only loads on `/score`.

## Technical notes

- No new dependencies, no YouTube embed — pure local audio.
- Volume fixed low (0.15) per the "subtle" requirement; no volume slider.
- Toggle is `aria-pressed` with `aria-label="Toggle background music"` for accessibility.
- Works identically on desktop and mobile; iOS Safari requires the user-gesture tap, which the toggle satisfies.

## Out of scope

- Volume slider, track switching, fade in/out animations, music on other pages.
