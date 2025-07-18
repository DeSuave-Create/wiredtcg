import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface Player {
  id: string;
  room_id: string;
  name: string;
  score: number;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  code: string;
  admin_token: string;
  created_at: string;
  updated_at: string;
}

export interface RoomWithPlayers extends Room {
  players: Player[];
}

class RoomStorageService {
  private listeners: ((room: RoomWithPlayers | null) => void)[] = [];
  private channel: RealtimeChannel | null = null;

  async createRoom(roomData: { code: string; admin_token: string }): Promise<Room> {
    const { data: room, error } = await supabase
      .from('rooms')
      .insert(roomData)
      .select()
      .single();

    if (error) throw error;
    return room;
  }

  async getRoom(code: string): Promise<RoomWithPlayers | null> {
    const { data: room, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('code', code)
      .single();

    if (error) {
      console.error('Error fetching room:', error);
      return null;
    }

    const { data: players, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', room.id)
      .order('created_at', { ascending: true });

    if (playersError) {
      console.error('Error fetching players:', playersError);
      return { ...room, players: [] };
    }

    return { ...room, players: players || [] };
  }

  async addPlayer(roomId: string, playerData: Omit<Player, 'id' | 'room_id' | 'created_at' | 'updated_at'>): Promise<Player> {
    const { data: player, error } = await supabase
      .from('players')
      .insert({
        room_id: roomId,
        ...playerData
      })
      .select()
      .single();

    if (error) throw error;
    return player;
  }

  async updatePlayer(playerId: string, updates: Partial<Pick<Player, 'name' | 'score'>>): Promise<Player> {
    const { data: player, error } = await supabase
      .from('players')
      .update(updates)
      .eq('id', playerId)
      .select()
      .single();

    if (error) throw error;
    return player;
  }

  async removePlayer(playerId: string): Promise<void> {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', playerId);

    if (error) throw error;
  }

  async bulkUpdatePlayers(roomId: string, players: Omit<Player, 'room_id' | 'created_at' | 'updated_at'>[]): Promise<void> {
    // First, delete all existing players for this room
    await supabase
      .from('players')
      .delete()
      .eq('room_id', roomId);

    // Then insert the new players
    if (players.length > 0) {
      const { error } = await supabase
        .from('players')
        .insert(players.map(player => ({
          name: player.name,
          score: player.score,
          room_id: roomId
        })));

      if (error) throw error;
    }
  }

  subscribeToRoom(roomCode: string, callback: (room: RoomWithPlayers | null) => void): () => void {
    this.listeners.push(callback);

    // Set up realtime subscription
    this.channel = supabase
      .channel(`room_${roomCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players'
        },
        async () => {
          // Refetch room data when players change
          const room = await this.getRoom(roomCode);
          this.listeners.forEach(listener => listener(room));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms'
        },
        async () => {
          // Refetch room data when room changes
          const room = await this.getRoom(roomCode);
          this.listeners.forEach(listener => listener(room));
        }
      )
      .subscribe();

    return () => {
      // Remove listener
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }

      // Unsubscribe from realtime if no more listeners
      if (this.listeners.length === 0 && this.channel) {
        supabase.removeChannel(this.channel);
        this.channel = null;
      }
    };
  }
}

export const roomStorage = new RoomStorageService();