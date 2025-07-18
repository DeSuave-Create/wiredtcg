-- Remove character column from players table since we're switching to custom names only
ALTER TABLE public.players DROP COLUMN IF EXISTS character;