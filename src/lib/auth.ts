import { supabase } from './supabase';
import { Profile } from '../types/database';
import { rateLimit, validateCredentials, sanitizeInput } from './security';
import { validateLoginCredentials } from './validation';

export const AUTH_PROVIDERS = {
  EMAIL: 'email',
  GOOGLE: 'google',
  MICROSOFT: 'azure',
} as const;

export const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

export interface AuthConfig {
  provider: keyof typeof AUTH_PROVIDERS;
  redirectTo?: string;
}

export async function signUp(email: string, password: string, profile: Partial<Profile>) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: profile.full_name,
        role: profile.role,
      },
    },
  });

  if (authError) throw authError;

  if (!authData.user) {
    throw new Error('User creation failed');
  }

  // Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert([
      {
        id: authData.user.id,
        email: authData.user.email,
        full_name: profile.full_name,
        role: profile.role,
        organization: profile.organization,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        two_factor_enabled: false,
      },
    ], {
      onConflict: 'id',
    });

  if (profileError) {
    console.error('Error creating profile:', profileError);
    // Delete the auth user if profile creation fails
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw profileError;
  }

  return authData;
}

export async function signIn(email: string, password: string) {
  // Input validation
  email = sanitizeInput(email.trim().toLowerCase());
  
  // Validate credentials
  const validationResult = await validateLoginCredentials(email, password);
  if (!validationResult.isValid) {
    throw new Error(validationResult.errors.join('\n'));
  }

  // Rate limiting
  const canProceed = await rateLimit('signin', email);
  if (!canProceed) {
    throw new Error('Too many sign in attempts. Please try again later.');
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Log failed attempt
      await supabase.from('user_activity_logs').insert({
        action_type: 'signin_attempt',
        action_description: 'Failed sign in attempt',
        metadata: { email },
      });

      if (error.message === 'Invalid login credentials') {
        throw new Error('Incorrect password. Please try again');
      }
      throw error;
    }

    // Update last login and ensure profile exists
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ 
        id: data.user.id,
        email: data.user.email,
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id',
      });

    if (profileError) {
      console.error('Error updating profile:', profileError);
    }

    // Log successful sign in
    await supabase.from('user_activity_logs').insert({
      action_type: 'signin_success',
      action_description: 'Successful sign in',
      user_id: data.user.id,
      metadata: { email },
    });

    return data;
  } catch (error) {
    // Re-throw the error to be handled by the caller
    throw error;
  }
}

export async function resetPassword(email: string) {
  // Input validation
  email = sanitizeInput(email.trim().toLowerCase());
  
  // Rate limiting
  const canProceed = await rateLimit('reset_password', email);
  if (!canProceed) {
    throw new Error('Too many password reset attempts. Please try again later.');
  }

  try {
    // Check if user exists
    const { data: profile } = await supabase
      .from('profiles')
      .select('account_status')
      .eq('email', email)
      .single();

    if (!profile) {
      // Don't reveal if account exists
      return;
    }

    if (profile.account_status === 'suspended') {
      throw new Error('This account has been suspended. Please contact support.');
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;

    // Log password reset attempt
    await supabase.from('user_activity_logs').insert({
      action_type: 'password_reset_request',
      action_description: 'Password reset requested',
      metadata: { email },
    });

  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
}

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });

  if (error) throw error;
}

export async function setupTwoFactor(userId: string) {
  // Implementation for 2FA setup
  // This would integrate with a 2FA provider
}

export async function verifyTwoFactor(userId: string, token: string) {
  // Implementation for 2FA verification
}

export function getSessionTimeout() {
  return SESSION_TIMEOUT;
}

export async function validateIpAccess(userId: string, ip: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('ip_whitelist')
    .eq('id', userId)
    .single();

  if (!profile?.ip_whitelist?.length) return true;
  return profile.ip_whitelist.includes(ip);
}