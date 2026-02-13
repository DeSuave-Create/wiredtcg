

# Make the Role Selector More Obvious

## Problem
On desktop, the classification/role name looks like plain static text because the chevron arrow is hidden and there's no visual border or background. Users don't realize it's clickable.

## Solution
Add subtle visual cues that signal interactivity without breaking the clean aesthetic:

1. **Show the chevron icon** -- Remove the `[&>svg]:hidden` class from the desktop SelectTrigger so the small dropdown arrow appears next to the role name.

2. **Add a hover underline effect** -- Add `hover:underline` and `cursor-pointer` so hovering reveals it's interactive.

3. **Mobile** -- The mobile dropdown already has a visible border/background, so no changes needed there.

## Technical Details

### File: `src/components/PlayerCard.tsx` (line 153)

Update the desktop `SelectTrigger` className:
- Remove: `[&>svg]:hidden`
- Add: `hover:underline cursor-pointer`

The chevron will inherit the role's text color since it's inside the trigger element. This is a single-line class change.

