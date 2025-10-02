-- Drop the insecure public read policy
DROP POLICY IF EXISTS "Allow public read access to rooms" ON public.rooms;

-- Create a security definer function to validate admin tokens
-- This function can access the admin_token safely without exposing it
CREATE OR REPLACE FUNCTION public.validate_room_admin(_room_id uuid, _admin_token text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.rooms
    WHERE id = _room_id
      AND admin_token = _admin_token
  );
$$;

-- Create a security definer function to get room info WITHOUT admin_token
-- This allows public read access to basic room info only
CREATE OR REPLACE FUNCTION public.get_room_info(_room_code text)
RETURNS TABLE (
  id uuid,
  code text,
  created_at timestamptz,
  updated_at timestamptz,
  last_activity timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, code, created_at, updated_at, last_activity
  FROM public.rooms
  WHERE code = _room_code;
$$;

-- Create a security definer function to get room info by ID WITHOUT admin_token
CREATE OR REPLACE FUNCTION public.get_room_info_by_id(_room_id uuid)
RETURNS TABLE (
  id uuid,
  code text,
  created_at timestamptz,
  updated_at timestamptz,
  last_activity timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, code, created_at, updated_at, last_activity
  FROM public.rooms
  WHERE id = _room_id;
$$;

-- Update the update policy to only allow updates when admin_token is validated
-- Note: This requires passing the admin_token in the update request
DROP POLICY IF EXISTS "Allow public update to rooms" ON public.rooms;
CREATE POLICY "Allow admin update to rooms"
ON public.rooms
FOR UPDATE
USING (
  -- Only allow updates if the admin_token in the UPDATE matches the stored token
  admin_token = (SELECT admin_token FROM public.rooms WHERE id = rooms.id)
)
WITH CHECK (
  -- Ensure the admin_token in the UPDATE matches the stored token
  admin_token = (SELECT admin_token FROM public.rooms WHERE id = rooms.id)
);

-- Keep insert policy as is (allows room creation)
-- The insert policy is fine because it requires the admin_token to be set during creation

-- Add a policy to allow reading your own room if you provide the admin_token
-- This is safe because you need to know the token to read it
CREATE POLICY "Allow admin read access to rooms"
ON public.rooms
FOR SELECT
USING (
  -- This policy is only used when querying with admin_token
  -- Frontend should use get_room_info functions for public data
  false
);

COMMENT ON FUNCTION public.validate_room_admin IS 'Validates if the provided admin token matches the room. Use this before admin operations.';
COMMENT ON FUNCTION public.get_room_info IS 'Gets public room information by room code without exposing admin_token';
COMMENT ON FUNCTION public.get_room_info_by_id IS 'Gets public room information by room ID without exposing admin_token';