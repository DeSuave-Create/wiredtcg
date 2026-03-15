

## Sync All Electric Progress Bars

Currently each `ElectricProgressBar` instance runs its own independent timer and animation cycle. The fix: create a **shared global timer** at the module level that all instances subscribe to.

### Approach

Create a singleton animation controller in `ElectricProgressBar.tsx` that:
- Maintains a single global step counter
- Broadcasts step changes to all mounted instances via a subscribe/unsubscribe pattern
- Only runs when at least one instance is visible (via IntersectionObserver)

### Changes

**`src/components/ElectricProgressBar.tsx`**:
- Add a module-level `StepController` object that manages one shared timer and tracks the current step
- Instances subscribe on mount, unsubscribe on unmount
- Each instance's `IntersectionObserver` registers/unregisters visibility — the global timer runs when any instance is visible
- All instances read from the same step value, so bolts and node states are perfectly synchronized
- Reset cycle (hold 1s then restart) is handled once globally

