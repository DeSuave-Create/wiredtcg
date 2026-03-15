

## Fix Card Counts: Cable (3x) 9→8, Total 144→143

The reference sheet shows **8x Cable (3x)** and **143 total cards**. Three files still have the old count of 9 / 144, plus several text references say "145."

### Files to update

1. **`src/utils/deckBuilder.ts`** (line 37)
   - `'cable-3': 9` → `'cable-3': 8`
   - Comment on line 32: `144 cards total` → `143 cards total`

2. **`src/utils/ai/config.ts`** (lines 123, 141)
   - `'cable-3': 9` → `'cable-3': 8`
   - `TOTAL_DECK_SIZE = 144` → `TOTAL_DECK_SIZE = 143`

3. **`src/components/GameMechanicsSection.tsx`** (lines 23, 30)
   - Comment: `145 cards total` → `143 cards total`
   - Loop: `for (let i = 0; i < 9; i++)` (Cabling 3x) → `< 8`

4. **`src/hooks/useGameEngine.ts`** (line 18)
   - Comment: `1/8 of 144-card deck` → `1/8 of 143-card deck`
   - `DECK_RESHUFFLE_THRESHOLD = 18` → keep as `18` (still approximately 1/8)

5. **`src/pages/Extras.tsx`** (line 330)
   - `"All 145 unique cards"` → `"All 143 unique cards"`

6. **`src/pages/CardReference.tsx`** (line 163)
   - `"All 145 unique cards"` → `"All 143 unique cards"`

7. **`src/pages/FAQs.tsx`** (line 32)
   - `"145 cards plus one informational card"` → `"143 cards plus one informational card"`

### Summary
Seven files, all one-line changes. This aligns the entire codebase with the official card list reference sheet.

