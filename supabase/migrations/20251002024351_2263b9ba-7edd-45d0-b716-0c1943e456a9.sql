-- Add an explicit SELECT policy that blocks all direct access to the rooms table
-- This makes it clear that all reads must go through the security definer functions
-- (get_room_info, get_room_info_by_id, get_room_admin_data, validate_room_admin)
CREATE POLICY "Block direct SELECT access to rooms"
ON public.rooms
FOR SELECT
USING (false);

COMMENT ON POLICY "Block direct SELECT access to rooms" ON public.rooms IS 
'Blocks all direct SELECT queries. Use get_room_info() for public data or get_room_admin_data() for admin access.';