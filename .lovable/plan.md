

## Add AI Logic to Play Audited Computers

### Problem

When the AI is audited, removed computers are placed into `auditedComputers`. The AI action generator never checks this array, so those computers are permanently stranded -- the AI never replays them.

### Solution

Teach the AI to treat audited computers the same as computers in hand when generating build actions.

---

### Changes

**File: `src/utils/ai/actionGenerator.ts`**

In `generateBuildActions()`, after the existing logic that generates `play_computer` actions from `aiPlayer.hand`, add a parallel block that iterates over `aiPlayer.auditedComputers`. For each audited computer, generate `play_computer` actions targeting every available cable slot (same logic as hand computers). The `EvaluatedAction` should include a flag or metadata indicating `isAudited: true` and the `auditedIndex` so the execution layer knows to pull from `auditedComputers` instead of `hand`.

Give audited computers a small utility bonus (~+5-10) over hand computers to prioritize replaying them first (they don't cost a draw).

**File: `src/hooks/useGameEngine.ts`**

In the `executeAITurn` function's `play_computer` case, add handling for audited computers. If the action's card came from `auditedComputers` (check by matching card ID against `aiPlayer.auditedComputers`), call the existing `playAuditedComputer` function instead of removing the card from `hand`. This avoids duplicating the placement logic.

---

### Summary

| File | Change |
|------|--------|
| `src/utils/ai/actionGenerator.ts` | Generate `play_computer` actions from `auditedComputers` in `generateBuildActions()` |
| `src/hooks/useGameEngine.ts` | Handle audited computer source in `executeAITurn`'s `play_computer` case |

