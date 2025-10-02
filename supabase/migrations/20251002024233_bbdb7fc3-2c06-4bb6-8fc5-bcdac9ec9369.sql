-- Drop the broken read policy that blocks all access
DROP POLICY IF EXISTS "Allow admin read access to rooms" ON public.rooms;

-- Create a security definer function for admins to get full room data (including admin_token)
-- This safely validates the admin token before returning sensitive data
CREATE OR REPLACE FUNCTION public.get_room_admin_data(_room_id uuid, _admin_token text)
RETURNS TABLE (
  id uuid,
  code text,
  admin_token text,
  created_at timestamptz,
  updated_at timestamptz,
  last_activity timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, code, admin_token, created_at, updated_at, last_activity
  FROM public.rooms
  WHERE id = _room_id
    AND admin_token = _admin_token;
$$;

COMMENT ON FUNCTION public.get_room_admin_data IS 'Returns full room data including admin_token, but only if the provided token matches. Use this for admin operations that need the token.';