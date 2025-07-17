// Mock room storage service - simulates backend functionality
// In production, this would be replaced with Supabase calls

interface Player {
  id: string;
  name: string;
  character: string;
  score: number;
}

interface Room {
  id: string;
  code: string;
  adminToken: string;
  players: Player[];
  createdAt: string;
  updatedAt: string;
}

class RoomStorageService {
  private storageKey = 'wired_rooms';
  private listeners: ((rooms: Record<string, Room>) => void)[] = [];

  private getRooms(): Record<string, Room> {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private saveRooms(rooms: Record<string, Room>): void {
    localStorage.setItem(this.storageKey, JSON.stringify(rooms));
    // Notify listeners of changes
    this.listeners.forEach(listener => listener(rooms));
  }

  async createRoom(room: Room): Promise<Room> {
    const rooms = this.getRooms();
    rooms[room.code] = room;
    this.saveRooms(rooms);
    return room;
  }

  async getRoom(code: string): Promise<Room | null> {
    const rooms = this.getRooms();
    return rooms[code] || null;
  }

  async updateRoom(code: string, updates: Partial<Room>): Promise<Room | null> {
    const rooms = this.getRooms();
    if (!rooms[code]) return null;
    
    rooms[code] = { 
      ...rooms[code], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    this.saveRooms(rooms);
    return rooms[code];
  }

  onRoomChange(callback: (rooms: Record<string, Room>) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Listen for storage changes from other tabs/windows
  startListening(): void {
    window.addEventListener('storage', (e) => {
      if (e.key === this.storageKey) {
        const rooms = this.getRooms();
        this.listeners.forEach(listener => listener(rooms));
      }
    });
  }
}

export const roomStorage = new RoomStorageService();
export type { Room, Player };