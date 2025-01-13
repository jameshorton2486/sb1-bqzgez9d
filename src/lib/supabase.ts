import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uzxhlfceordaczeksyev.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6eGhsZmNlb3JkYWN6ZWtzeWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2MzYyMTIsImV4cCI6MjA1MjIxMjIxMn0.xkVDv3vGQOFrmmEVc1-GnWdpdbnHuxt7KRqZMPirJVM';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});