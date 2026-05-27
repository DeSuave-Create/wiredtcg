Remove the dismiss functionality from `src/components/KickstarterAnnouncementBar.tsx` so users cannot close the announcement bar.

### Changes
1. **Remove the X (close) button** from the component's JSX.
2. **Remove `handleDismiss`** function and `STORAGE_KEY` constant.
3. **Remove `useEffect` + `sessionStorage` check** and the `visible` state, since the bar is now always shown.
4. **Clean up imports**: remove unused `useEffect` and `X` from `lucide-react`.