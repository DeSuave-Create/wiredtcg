import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Clean up rooms inactive for more than 24 hours
    const cutoffTime = new Date()
    cutoffTime.setHours(cutoffTime.getHours() - 24)

    console.log(`Cleaning up rooms inactive since: ${cutoffTime.toISOString()}`)

    // First, get rooms to be deleted for logging
    const { data: roomsToDelete, error: selectError } = await supabaseClient
      .from('rooms')
      .select('id, code, last_activity')
      .lt('last_activity', cutoffTime.toISOString())

    if (selectError) {
      throw selectError
    }

    console.log(`Found ${roomsToDelete.length} rooms to clean up`)

    if (roomsToDelete.length > 0) {
      // Delete associated players first (due to foreign key relationships)
      const roomIds = roomsToDelete.map(room => room.id)
      
      const { error: playersDeleteError } = await supabaseClient
        .from('players')
        .delete()
        .in('room_id', roomIds)

      if (playersDeleteError) {
        throw playersDeleteError
      }

      // Then delete the rooms
      const { error: roomsDeleteError } = await supabaseClient
        .from('rooms')
        .delete()
        .in('id', roomIds)

      if (roomsDeleteError) {
        throw roomsDeleteError
      }

      console.log(`Successfully cleaned up ${roomsToDelete.length} rooms and their players`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        cleaned_rooms: roomsToDelete.length,
        cutoff_time: cutoffTime.toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Room cleanup error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})