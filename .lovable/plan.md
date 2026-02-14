

## Rename `/cart` route to `/shop`

This is a simple find-and-replace across 3 files. Button text like "Add to Cart" and localStorage keys like `cartItems` will stay unchanged.

### Changes

**1. `src/App.tsx`**
- Change route path from `/cart` to `/shop`

**2. `src/components/Footer.tsx`**
- Change link from `/cart` to `/shop`
- Change link text from "View Cart" to "View Shop"

**3. `src/pages/ShoppingCart.tsx`**
- Change `handleContinueShopping` URL from `/cart` to `/shop`

### Technical Details

- Only 3 files need editing, each with a single-line change
- The page component file `src/pages/Cart.tsx` keeps its filename (optional rename, but not required for functionality)
- All internal logic (`cartItems`, `localStorage`, "Add to Cart" buttons) stays as-is per your request
- The Header nav does not link to `/cart`, so no change needed there

