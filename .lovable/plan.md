

# Generate WIRED Kickstarter TOC Artwork -- Admin Page

## Overview
Create a new `/admin/artwork` page (password-protected like `/admin/products`) with an edge function that generates a cyberpunk/neon table of contents image using the Lovable AI image generation model. The page will display the generated artwork and allow downloading it.

## What Gets Built

### 1. Edge Function: `generate-toc-art`
- Uses `google/gemini-2.5-flash-image` model via `https://ai.gateway.lovable.dev/v1/chat/completions`
- Authenticated with `x-admin-password` header (same pattern as `admin-products`)
- Sends a detailed image generation prompt that references WIRED's cyberpunk aesthetic and includes:
  - TOC sections: Welcome to WIRED, How to Play, What's in the Box, Game Modes, Reward Tiers, Add-Ons, Stretch Goals
  - Art direction: dark background, neon green/blue/purple glows, circuit board traces, network cables
  - References to the classification character artwork (Security Specialist, Headhunter, Field Tech, Facilities Manager, Auditor, Supervisor) -- described in the prompt so the AI creates characters inspired by them
  - Playing card elements woven through the design
- Returns the base64 image data to the client

### 2. New Page: `src/pages/AdminArtwork.tsx`
- Password-protected login screen (reuses the same admin password pattern from AdminProducts)
- "Generate Artwork" button that calls the edge function
- Loading state with progress indication while generating
- Displays the generated image full-size
- "Download" button that saves the image as a PNG file
- "Regenerate" button to try again if the result needs iteration
- Shows thumbnails of available character artwork assets for reference

### 3. Route Registration
- Add `/admin/artwork` route to `App.tsx` (lazy-loaded, not in navbar)

### 4. Config Update
- Add `generate-toc-art` function to `supabase/config.toml` with `verify_jwt = false`

## Available Assets Referenced in Prompt
The prompt will describe characters inspired by these existing assets:
- `artwork-security.png`, `artwork-headhunter.png`, `artwork-fieldtech.png`
- `artwork-facilities.png`, `artwork-auditor.png`, `artwork-supervisor.png`
- Card images: `classification-*`, `attack-*`, `resolution-*`, `equipment-*`

Note: The AI image model cannot directly use these images as input in a text-only prompt, but the prompt will describe the cyberpunk character styles so the generated art matches the WIRED aesthetic. For higher fidelity, the page will also display the existing character art alongside the generated TOC so you can composite them in a design tool if needed.

## Technical Details

### Edge Function (`supabase/functions/generate-toc-art/index.ts`)
- CORS headers included
- Admin password check via `x-admin-password` header
- Calls Lovable AI gateway with `modalities: ["image", "text"]`
- Returns `{ image: "data:image/png;base64,..." }` on success
- Handles 429/402 rate limit errors

### Frontend Page (`src/pages/AdminArtwork.tsx`)
- Same Header/Footer/ContentSection layout as AdminProducts
- Password state stored in component (same UX as AdminProducts)
- Uses `fetch` to call the edge function
- Download implemented via creating an `<a>` element with `download` attribute
- Shows existing character artwork cards in a gallery section for reference

### Files Changed
- **New**: `supabase/functions/generate-toc-art/index.ts`
- **New**: `src/pages/AdminArtwork.tsx`
- **Modified**: `src/App.tsx` -- add lazy route for `/admin/artwork`
- **Modified**: `supabase/config.toml` -- add function config

