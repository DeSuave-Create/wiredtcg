-- Add performance indexes for rooms and players tables

-- Index on rooms.code for fast room lookups
CREATE INDEX IF NOT EXISTS idx_rooms_code ON public.rooms (code);

-- Index on players.room_id for fast player queries by room
CREATE INDEX IF NOT EXISTS idx_players_room_id ON public.players (room_id);

-- Composite index for players by room and creation order (for consistent ordering)
CREATE INDEX IF NOT EXISTS idx_players_room_created ON public.players (room_id, created_at);

-- Add room cleanup columns
ALTER TABLE public.rooms ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create trigger to update last_activity on room or player changes
CREATE OR REPLACE FUNCTION public.update_room_activity()
RETURNS TRIGGER AS $$
BEGIN
  -- Update last_activity for the room when players are modified
  UPDATE public.rooms 
  SET last_activity = now() 
  WHERE id = COALESCE(NEW.room_id, OLD.room_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for player changes
DROP TRIGGER IF EXISTS update_room_activity_on_player_insert ON public.players;
CREATE TRIGGER update_room_activity_on_player_insert
  AFTER INSERT ON public.players
  FOR EACH ROW EXECUTE FUNCTION public.update_room_activity();

DROP TRIGGER IF EXISTS update_room_activity_on_player_update ON public.players;
CREATE TRIGGER update_room_activity_on_player_update
  AFTER UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION public.update_room_activity();

DROP TRIGGER IF EXISTS update_room_activity_on_player_delete ON public.players;
CREATE TRIGGER update_room_activity_on_player_delete
  AFTER DELETE ON public.players
  FOR EACH ROW EXECUTE FUNCTION public.update_room_activity();

-- Create trigger to update last_activity on room updates
DROP TRIGGER IF EXISTS update_room_activity_on_room_update ON public.rooms;
CREATE TRIGGER update_room_activity_on_room_update
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();