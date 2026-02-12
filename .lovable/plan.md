

# Apply ContentSection Background to Player Cards

## What Changes
Update the `PlayerCard` component to use the same background styling as the `ContentSection` component:
- Background image: `/lovable-uploads/a08479d2-01b1-41b6-8666-5ded32438273.png`
- Semi-transparent overlay: `bg-card/60` with `backdrop-blur-[1px]`

## Technical Details

### File: `src/components/PlayerCard.tsx`

1. **Replace** the current card background (`bg-gray-900`) with the circuit board background image, matching the `ContentSection` pattern:
   - Add `backgroundImage`, `backgroundSize`, `backgroundPosition`, `backgroundRepeat` inline styles using the same image
   - Add an inner overlay div with `bg-card/60 backdrop-blur-[1px] rounded-3xl` (same as ContentSection)
   - Ensure existing content remains above the overlay via `relative z-10` (already in place for both mobile and desktop layouts)

2. **Remove** the existing circuit board pattern overlay (the inverted `/images/card-circuit-bg.png` at 30% opacity) since it will be replaced by the new background approach.

This keeps the player cards visually consistent with the outer section container.

