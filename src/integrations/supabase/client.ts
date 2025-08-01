// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://ptygikixnrdpleyntwrj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0eWdpa2l4bnJkcGxleW50d3JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTU0MzMsImV4cCI6MjA2ODE5MTQzM30.fvP5GsmPreDTXFDlEZJ-o9esEoy-KoVegqqAvY_tPqA";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});