-- Drop all functions related to rooms
DROP FUNCTION IF EXISTS public.get_room_admin_data(_room_id uuid, _admin_token text);
DROP FUNCTION IF EXISTS public.get_room_info_by_id(_room_id uuid);
DROP FUNCTION IF EXISTS public.get_room_info(_room_code text);
DROP FUNCTION IF EXISTS public.validate_room_admin(_room_id uuid, _admin_token text);
DROP FUNCTION IF EXISTS public.update_room_activity();

-- Drop the rooms table
DROP TABLE IF EXISTS public.rooms CASCADE;