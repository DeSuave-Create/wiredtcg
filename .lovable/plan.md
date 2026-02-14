

## Fix Facilities Artwork Size to Match Other Characters

### Problem
The Facilities character artwork appears much smaller than other characters (like Security Specialist) on the player card. This is because the source image file has excessive transparent/empty space surrounding the stick figure and lightbulb, making it look smaller when displayed at the same scale as other artwork.

### Solution
Apply per-character scaling so that each artwork fills its card area consistently, rather than using a single universal scale for all characters.

### Implementation

**File: `src/components/ScoreKeeper.tsx`**
- Add an optional `artworkScale` property to each character definition
- Set a larger scale value for Facilities (e.g., `scale-[1.8]` or `scale-[2]`) while keeping the default `scale-125` for others

**File: `src/components/PlayerCard.tsx`**
- Accept the `artworkScale` class from the character data
- Apply the per-character scale class to the artwork image instead of the hardcoded `scale-125`

### Technical Details

1. Update the `Character` interface in both files to include an optional `artworkScale` string field
2. In `ScoreKeeper.tsx`, add `artworkScale: 'scale-[1.8]'` to the Facilities character entry; other characters keep `scale-125` as default
3. In `PlayerCard.tsx`, replace the hardcoded `scale-125` class with `{character.artworkScale || 'scale-125'}` on the artwork image element
4. Fine-tune the exact scale value for Facilities after visual testing

This approach is clean and extensible -- if any future character artwork also needs size adjustments, it can be handled per-character without affecting others.

