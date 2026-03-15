

## Fix: Make Reset Network and Add Miner buttons the same size

The "Reset Network" button uses `size="sm"` (h-9) while "Add Miner" uses the default size (h-10). Fix by making both use the same size.

### Change in `src/components/GameHeader.tsx`

- **Line 23**: Remove `size="sm"` from the Reset Network button so both buttons use the default size (h-10)

One line, one file.

