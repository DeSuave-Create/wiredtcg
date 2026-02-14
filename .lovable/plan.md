

# Fix Video Player Empty Space in VideoCarousel

## Problem
The video player on `/extras` shows a large white empty area below the video controls. This happens because:
- `preload="none"` prevents the browser from fetching video metadata, so it doesn't know the video's dimensions
- The video element collapses to near-zero height while the container (`bg-gray-100`) fills the remaining space with white
- The carousel counter badge floats over empty white space

## Solution

### 1. Give the video container a fixed aspect ratio (`VideoCarousel.tsx`)
- Add `aspect-video` (16:9) to the video container so it maintains proper dimensions even before the video loads
- Change `preload="none"` to `preload="metadata"` -- this is a good middle ground: it fetches only a few KB of metadata (dimensions, duration) without downloading the full video file
- Set the video element to fill the container with `w-full h-full object-cover`
- Apply a dark background (`bg-black` or `bg-gray-900`) instead of `bg-gray-100` so the letterboxing matches the video aesthetic

### 2. Apply same fix to mobile/tablet video sections
- The mobile video section (below line 550) uses the same pattern and needs the same aspect-ratio treatment

## Technical Details

**File: `src/components/VideoCarousel.tsx`**
- Line 500: Change `bg-gray-100` to `bg-black` on the video container
- Add `aspect-video` class to ensure 16:9 ratio before video loads
- Line 547: Change `preload="none"` to `preload="metadata"`
- Line 546: Change `h-auto` to `h-full` and add `object-contain` so the video fills the aspect-ratio container

These are small, targeted changes -- no structural modifications needed.

