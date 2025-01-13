import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qsobullwqecodxtdtxrq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzb2J1bGx3cWVjb2R4dGR0eHJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYzODM2NjYsImV4cCI6MjA1MTk1OTY2Nn0.iSkXWsNBeihD-SvZzPhNK7O4QfLPOqiQCG6rffuigYQ';

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});