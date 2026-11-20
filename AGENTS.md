# Architecture rules
- Serve password-protected downloads from private Supabase Storage through a server-validated secret and a 60-second signed attachment URL; public CDN files cannot enforce download protection.
- Keep offline download attempt limits in a service-only table with an atomic RPC so limits persist across edge instances.
- Keep offline simulator access on its own lazy-loaded Extras subpage; never persist visitor passwords or signed links in browser storage.
- Deny direct client storage writes by default; product uploads use the password-authorized service, preventing write policies from granting access to unrelated buckets.