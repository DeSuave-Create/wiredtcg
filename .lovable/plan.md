

# Seal Mascot Animation

## Overview
Add the uploaded seal mascot image to the project, then integrate it into two locations with a gentle idle animation:
1. **Loading screen** — alongside the existing WIRED logo spinner
2. **Footer** — as a small animated corner mascot

## Plan

### 1. Copy the mascot image into the project
Copy `user-uploads://SealtheDeal_Stick_Figure_Only.png` to `public/images/mascot-seal.png`.

### 2. Add custom keyframes to `tailwind.config.ts`
Add a `mascot-bounce` keyframe — a gentle floating/bouncing loop (translateY oscillation + slight rotation) to give the seal a lively idle feel without being distracting.

### 3. Update `LoadingSpinner.tsx`
Add the seal mascot image next to the existing WIRED logo. The seal will float gently with the `mascot-bounce` animation while the existing shimmer bar remains below.

### 4. Update `Footer.tsx`
Add a small (40-48px) seal mascot in the footer brand section, next to or below the WIRED logo, with the same gentle bounce animation. On hover, it could do a slight wiggle for interactivity.

