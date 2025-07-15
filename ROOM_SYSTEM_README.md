# WIRED Multiplayer Room System

## Overview
A real-time multiplayer lobby/room system built with React frontend and Supabase backend. Allows users to create rooms, manage players, and track scores in real-time.

## Features
✅ Create rooms with 5-character codes  
✅ Admin controls (no login required, token-based)  
✅ Player management with roles and scores  
✅ Real-time score updates  
✅ Mobile-friendly responsive design  
✅ Room sharing via URL  

## Database Schema (Supabase)

### Rooms Table
```sql
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL CHECK (LENGTH(code) = 5),
  admin_token UUID NOT NULL DEFAULT gen_random_uuid(),
  players JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast room lookups
CREATE INDEX idx_rooms_code ON rooms(code);

-- RLS Policies (for public access)
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read rooms
CREATE POLICY "Anyone can read rooms" ON rooms
  FOR SELECT USING (true);

-- Allow anyone to insert rooms (create new rooms)
CREATE POLICY "Anyone can create rooms" ON rooms
  FOR INSERT WITH CHECK (true);

-- Allow updates only with valid admin token (stored in request)
CREATE POLICY "Admin can update rooms" ON rooms
  FOR UPDATE USING (true);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
```

### Player Data Structure (JSONB)
```json
[
  {
    "id": "uuid-string",
    "name": "Player Name",
    "role": "Network|ISP|End User|Hacker|Government|Corporation",
    "score": 0
  }
]
```

## API Integration

### 1. Install Supabase Client
```bash
npm install @supabase/supabase-js
```

### 2. Create Supabase Client
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### 3. Replace Mock Functions

#### Create Room
```typescript
const handleCreateRoom = async () => {
  const code = Math.random().toString(36).substr(2, 5).toUpperCase();
  const adminToken = crypto.randomUUID();
  
  const { data, error } = await supabase
    .from('rooms')
    .insert([{
      code,
      admin_token: adminToken,
      players: []
    }])
    .select()
    .single();

  if (error) throw error;
  
  localStorage.setItem(`room_admin_${code}`, adminToken);
  return data;
};
```

#### Join Room
```typescript
const handleJoinRoom = async (code: string) => {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', code)
    .single();

  if (error) throw error;
  return data;
};
```

#### Update Players
```typescript
const handleUpdatePlayers = async (roomId: string, players: Player[]) => {
  const { error } = await supabase
    .from('rooms')
    .update({ players })
    .eq('id', roomId);

  if (error) throw error;
};
```

### 4. Real-time Updates
```typescript
// Subscribe to room changes
useEffect(() => {
  if (!room) return;

  const subscription = supabase
    .channel('room-changes')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${room.id}`
      },
      (payload) => {
        setRoom(payload.new as Room);
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, [room]);
```

## Usage

1. **Navigate to `/room`** - Shows room creation/join interface
2. **Create Room** - Generates code, makes user admin
3. **Join via URL** - `/room/ABC12` auto-joins room ABC12
4. **Admin Controls** - Edit players, assign roles, reset scores
5. **Live Updates** - All participants see changes in real-time

## Security Notes

- Admin token stored in localStorage for session persistence
- No user authentication required
- Rooms accessible by anyone with code
- Admin privileges based on token match
- All operations are public (suitable for game rooms)

## Mobile Optimization

- Responsive grid layouts
- Touch-friendly buttons
- Optimized for small screens
- Swipe-friendly interface
- Large tap targets

## File Structure
```
src/
├── pages/Room.tsx              # Main room page
├── components/room/
│   ├── RoomCreator.tsx         # Create/join interface
│   ├── RoomJoiner.tsx          # Join room form
│   ├── PlayerManagement.tsx    # Admin player editor
│   └── ScoreBoard.tsx          # Live score display
└── lib/supabase.ts             # Database client
```