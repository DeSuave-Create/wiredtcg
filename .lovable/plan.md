

## Fix AI Freeze After Floating Equipment Attacks/Audit + Cable Placement Prompt

Three bugs need to be fixed in `src/hooks/useGameEngine.ts` and one in `src/pages/SimulationLog.tsx`.

---

### Bug 1: AI cannot resolve issues on floating equipment

**Root cause**: `findResolutionTarget` (line 2275) only searches `aiNetwork.switches` and their nested cables/computers. It never checks `floatingCables`, computers on floating cables, or `floatingComputers`. When the AI's floating equipment is attacked, the AI generates a valid `play_resolution` action but execution fails because the target isn't found, causing consecutive failures until the AI freezes.

**Fix in `useGameEngine.ts`**:

1. Expand the return type of `findResolutionTarget` to include `'floatingCable' | 'floatingComputer'` with a `floatingIndex` field.
2. After the existing switch loop, add searches through:
   - `aiNetwork.floatingCables` and their `attachedIssues`
   - Computers on floating cables
   - `aiNetwork.floatingComputers` and their `attachedIssues`
3. Expand `applyResolution` (line 2332) to handle the new floating target types -- remove issues and update `isDisabled`.
4. Update the `play_resolution` case (line 2456) to extract `issueBeingFixed` from floating targets.

---

### Bug 2: AI cannot attack floating equipment

**Root cause**: `findAttackTarget` (line 2250) also only searches connected switches. If the human only has floating equipment, the AI can't find any attack targets.

**Fix in `useGameEngine.ts`**:

1. Extend `findAttackTarget` to also search `humanNetwork.floatingCables` and `humanNetwork.floatingComputers`.
2. Extend `applyAttack` (line 2311) to handle floating target types.

---

### Bug 3: AI cannot execute audit attacks

**Root cause**: The AI action generator produces `start_audit` actions, but there is no `case 'start_audit'` handler in the `executeAITurn` switch statement (falls through to `default` which does nothing).

**Fix in `useGameEngine.ts`**:

Add a `case 'start_audit'` handler before the `default` case (~line 2970) that:
- Finds the audit card in the AI's hand
- Removes it from hand
- Counts the human player's computers
- Calculates `computersToReturn` (1 per 2 computers, minimum 1)
- Sets game phase to `'audit'` with an `auditBattle` object
- Pushes to `aiActions` and `gameLog`
- Breaks out of the AI turn loop to let the audit resolution flow handle the rest

---

### Bug 4: Cable placement doesn't prompt to connect floating computers

**Root cause**: In `SimulationLog.tsx` (lines 491-501), `gameState.players[0]` is read from the closure's `gameState`, which is the state snapshot from the current render -- before `playCable`'s `setGameState` has been applied. The floating computer check reads stale data.

**Fix in `SimulationLog.tsx`**:

Use `setTimeout(() => { ... }, 0)` to defer the floating computer check until after React has processed the state update from `playCable`. Inside the timeout, read the latest state via a ref or by checking the `playCable` result directly. Apply this fix to all three places where `setConnectDialog` is triggered after cable placement (lines 498, 513, and the similar block around line 520).

---

### Summary of file changes

| File | Changes |
|------|---------|
| `src/hooks/useGameEngine.ts` | Extend `findResolutionTarget`, `applyResolution`, `findAttackTarget`, and `applyAttack` to handle floating equipment. Add `case 'start_audit'` handler. |
| `src/pages/SimulationLog.tsx` | Defer floating computer dialog check after cable placement using `setTimeout`. |

