## Add Kickstarter section under Learn to Play button

Add a second CTA section beneath the existing "Learn to Play" button in `src/components/HeroSection.tsx`.

### Content
- Short headline + tagline promoting the upcoming Kickstarter campaign (e.g. "Back us on Kickstarter" / "Our campaign is launching soon — be the first to know").
- A prominent Kickstarter button styled distinctly from the outline "Learn to Play" button (filled, Kickstarter-green accent using existing primary token, with a Rocket icon).
- Button stores the URL `https://www.kickstarter.com/projects/wiredtcg/wired-the-card-game` in a constant for easy future activation.

### Behavior (for now)
- Clicking the button does NOT navigate to Kickstarter.
- Triggers the same "Coming Soon" reveal animation pattern already used in `KickstarterAnnouncementBar` (toast notification + brief inline reveal/pulse state).
- Once approved to go live, swap the click handler for `window.open(KICKSTARTER_URL, '_blank')`.

### Layout
- New section sits directly below the existing button row, separated by a divider or spacing (`mt-8`), visually grouped in its own subtle card/panel so it reads as a distinct CTA rather than a duplicate of Learn to Play.

### Files
- Edit only `src/components/HeroSection.tsx`.

No design tokens, routes, or business logic outside the hero are changed.