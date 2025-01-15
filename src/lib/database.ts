import { supabase } from './supabase';
import { SupabaseError, handleDatabaseError } from './errors';
import type { Profile } from '../types/database';

// Verify database connection
export async function verifyConnection() {
  try {
    const { data, error } = await supabase
      .rpc('test_connection');
      
    if (error) throw error;
    return data;
  } catch (error) {
    handleDatabaseError(error);
  }
}

// Get user profile
export async function getProfile(userId: string): Promise<Profile> {
  try {
    const { data, error } = await supabase
      .rpc('get_profile', { user_id: userId });
      
    if (error) throw error;
    if (!data) throw new Error('Profile not found');
    
    return data;
  } catch (error) {
    handleDatabaseError(error);
  }
}

// Update user profile
export async function updateProfile(userId: string, updates: {
  full_name?: string;
  organization?: string;
}): Promise<Profile> {
  try {
    const { data, error } = await supabase
      .rpc('update_profile', {
        user_id: userId,
        full_name: updates.full_name,
        organization: updates.organization
      });
      
    if (error) throw error;
    if (!data) throw new Error('Failed to update profile');
    
    return data;
  } catch (error) {
    handleDatabaseError(error);
  }
}