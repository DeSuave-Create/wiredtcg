

# Fix Video Thumbnail Previews

## Problem
The thumbnail navigation bar at the bottom of the video carousel shows the WIRED logo instead of actual video preview frames. This happens because:
- No `thumbnail` property is set in the `tutorialVideos` array in `Extras.tsx`
- The fallback in `VideoCarousel.tsx` (line 729) renders `<Logo>` when no thumbnail exists

## Solution

Generate thumbnails dynamically from each video's first frame using a small React hook that loads the video into a hidden `<video>` element, seeks to a frame, and captures it to a canvas as a data URL.

### 1. Create a `useVideoThumbnail` hook (`src/hooks/useVideoThumbnail.ts`)
- Accepts a video `src` URL and an optional `time` (default 1 second)
- Creates a temporary `<video>` element off-screen
- Sets `preload="metadata"`, seeks to the specified time
- On `seeked` event, draws the frame to a `<canvas>` and returns the data URL
- Returns `null` while loading, so the Logo fallback still shows briefly

### 2. Update thumbnail rendering in `VideoCarousel.tsx` (lines 706-736)
- Create a small `VideoThumbnail` sub-component that uses the hook
- Replace the current fallback block so that when no `video.thumbnail` is provided, it auto-generates one from the video file
- Keep the Logo as a loading placeholder while the thumbnail generates

### Technical Details

**New file:** `src/hooks/useVideoThumbnail.ts`
```
- Creates hidden video element
- Seeks to 1s, captures frame via canvas.toDataURL()
- Returns the data URL string or null
```

**Modified file:** `src/components/VideoCarousel.tsx` (lines ~706-736)
- Add a `VideoThumbnail` component that wraps each thumbnail button
- Uses the hook to auto-generate previews from the MP4 source
- Falls back to Logo while generating

No changes needed to `Extras.tsx` -- thumbnails will be generated automatically from the existing video sources.

