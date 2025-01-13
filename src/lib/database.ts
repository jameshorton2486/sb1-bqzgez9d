import { supabase } from './supabase';

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('secure_profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: {
  full_name?: string;
  organization?: string;
}) {
  const { data, error } = await supabase
    .rpc('update_profile', {
      user_id: userId,
      full_name: updates.full_name,
      organization: updates.organization
    });
    
  if (error) throw error;
  return data;
}

export async function verifyDatabaseAccess() {
  try {
    const { data: profile } = await supabase
      .from('secure_profiles')
      .select('id')
      .limit(1)
      .single();
      
    return !!profile;
  } catch (error) {
    console.error('Database access verification failed:', error);
    return false;
  }
}