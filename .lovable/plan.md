## Goal

Add a sitewide announcement banner at the very top of every page promoting the Kickstarter. Clicking it does NOT open the URL yet — instead it triggers a playful "Coming Soon" animation.

## Implementation

### 1. New component: `src/components/KickstarterAnnouncementBar.tsx`
- Full-width bar, centered content, fixed at the top of the page above the `Header` (sticky so it stays visible).
- Styling: on-brand cyber/glass look using semantic tokens (gradient from `primary` to `accent`, subtle electric shimmer). Compact height (~36–40px desktop, ~32px mobile). Text centered: e.g. `⚡ Back WIRED on Kickstarter — Launching Soon ⚡`.
- Behavior: it's a `<button>` (not a link). On click:
  - Trigger a "Coming Soon" reveal: the bar's label morphs / slides to show `🚀 Coming Soon — Stay Tuned!` with a quick scale + glow pulse, then reverts after ~2.5s.
  - Also fires a small toast (using existing `sonner`) saying `Kickstarter launching soon — we're approved!` for clarity on mobile.
  - The Kickstarter URL is stored as a constant in the component (commented `// TODO: enable when live`) so flipping to a real link later is a one-line change (swap the button for an `<a href>`).
- Dismissible: small `×` on the right that hides the bar for the session via `sessionStorage` key `ks-bar-dismissed`. Defaults to visible.

### 2. Mount globally
- Add `<KickstarterAnnouncementBar />` once in `src/App.tsx` inside `<BrowserRouter>`, before `<Suspense>`, so it renders above every route (Index, Extras, FAQs, Score, Founders, Cart, Simulation, admin pages, etc.) without editing each page.
- The existing `Header` is `sticky top-0`; the announcement bar will also be `sticky top-0 z-[60]` and Header gets stacked below it naturally (since Header is rendered after in DOM, both sticky elements stack). If stacking causes the Header to overlap, set the bar `relative` and let Header continue to stick — acceptable since the bar is meant as a top-of-page announcement, not persistently pinned.

### 3. Animation details
- Use Tailwind utility classes + a small keyframe in `tailwind.config.ts` (`announce-pulse`: scale 1 → 1.04 → 1 with glow) OR reuse existing `animate-pulse`/`animate-neon-flicker`.
- Text swap via React state with `animate-fade-in` on enter and `animate-fade-out` on exit (both already defined).

## Files

- create `src/components/KickstarterAnnouncementBar.tsx`
- edit `src/App.tsx` (mount the bar)
- edit `tailwind.config.ts` only if a new keyframe is needed (optional)

## Out of scope
- No analytics/tracking.
- No actual navigation to Kickstarter yet (URL kept as constant for easy flip later).
