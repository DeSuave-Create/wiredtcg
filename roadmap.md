# Protected offline simulator download
- [x] Store the download password securely and upload the ZIP to private storage.
- [x] Add server-side password checks and abuse protection.
- [x] Create /extras/offlinesim with password and download controls.
- [x] Verify blocked access, successful download, and mobile layout.

# Windows installer replacement
- [ ] Upload the Windows installer to private storage, replacing the ZIP download. Blocked: the 137,677,312-byte installer exceeds the project-wide Supabase Storage limit; the owner must raise it to at least 150 MB in Supabase Settings → Storage.
- [ ] Update the protected page and download service for the installer. Blocked by the installer upload; retain the functional ZIP download until the installer is available.
- [ ] Test password protection and installer downloads on desktop and mobile. Blocked by the installer upload.