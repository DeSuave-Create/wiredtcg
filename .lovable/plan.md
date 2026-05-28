## Goal

Prepare the site's video system to handle vertical 9:16 videos mixed alongside the existing 16:9 videos in the same `VideoCarousel`, supporting both self-hosted MP4 files and YouTube Shorts, with thumbnails that match each video's orientation.

## What changes

### 1. Video data model (`VideoCarousel.tsx` + `Extras.tsx`)
Add an optional `orientation` field to the `Video` interface:
- `orientation?: 'landscape' | 'portrait'` (defaults to `'landscape'` so existing videos are unaffected).
- Authors just add `orientation: 'portrait'` to any 9:16 entry in the `tutorialVideos` array in `Extras.tsx`.

### 2. Adaptive player frame
The player frame is currently hard-locked to `aspect-video` (16:9) in three render blocks (desktop center, mobile, and the YouTube placeholder/iframe heights `h-64 md:h-96`).
- Switch the player container aspect ratio based on the current video's orientation:
  - Landscape → `aspect-video` (16:9), as today.
  - Portrait → a centered `9/16` frame with a constrained max-width/height so a tall video doesn't dominate the page (capped height, e.g. `max-h-[70vh]`, centered on a black backdrop).
- Replace the fixed `h-64 md:h-96` placeholder/iframe heights with `w-full h-full` inside the orientation-aware container so both YouTube and MP4 fill correctly.
- The `<video>` element keeps `object-contain` so nothing is cropped; portrait videos sit in a portrait frame instead of being letterboxed inside a wide one.

### 3. YouTube Shorts support
- YouTube Shorts use the same `/embed/<id>` URL form, so existing `isYouTube` handling works — the only change needed is the orientation-aware frame (so a Short fills a 9:16 box instead of a 16:9 box). No new parsing required as long as authors provide the `/embed/<id>` URL.

### 4. Portrait thumbnails
- `VideoThumbnailButton` is fixed at `120px × 80px` (landscape). Make it orientation-aware:
  - Landscape thumb → `120 × 80` (unchanged).
  - Portrait thumb → portrait dimensions (e.g. `68 × 120`) so the strip visually signals a vertical video.
- The auto-thumbnail generator (`useVideoThumbnail`) already captures a frame from the MP4 and works regardless of orientation, with `object-cover` filling the button. Custom `thumbnail` images continue to work.

## Technical notes

- All changes are presentation-only inside `VideoCarousel.tsx` and the data array in `Extras.tsx`; no backend or game logic touched.
- Aspect handling done via Tailwind classes (`aspect-video` vs `aspect-[9/16]`) plus a max-height cap for portrait so tall videos stay reasonable on desktop.
- Existing pause-on-switch, navigation arrows, and counter behavior are unchanged.

```text
Carousel frame logic
 landscape: [ aspect-video, full width ]
 portrait : [ aspect-[9/16], centered, max-h-[70vh] ]
```

## Out of scope
- No changes to `VideoSection.tsx` unless you also want vertical support there (it's used for single embeds). Can be added on request.
- No new upload/admin tooling — authors add entries to the `tutorialVideos` array as today.