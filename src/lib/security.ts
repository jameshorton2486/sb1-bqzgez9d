import { supabase } from './supabase';

const RATE_LIMITS = {
  signup: { max: 5, window: 60 * 1000 }, // 5 attempts per minute
  signin: { max: 5, window: 60 * 1000 }, // 5 attempts per minute
  reset_password: { max: 3, window: 60 * 1000 }, // 3 attempts per minute
};

export async function rateLimit(action: keyof typeof RATE_LIMITS, identifier: string): Promise<boolean> {
  // Validate inputs
  if (!action || !identifier) {
    console.error('Rate limit check failed: Missing required parameters');
    return false;
  }

  if (!RATE_LIMITS[action]) {
    console.error(`Rate limit check failed: Invalid action type "${action}"`);
    return false;
  }

  const { max, window: timeWindow } = RATE_LIMITS[action];
  const now = new Date();
  const windowStart = new Date(now.getTime() - timeWindow);

  try {
    const { data, error } = await supabase
      .from('user_activity_logs')
      .select('id')
      .eq('action_type', action)
      .eq('metadata', JSON.stringify({ identifier }))
      .gte('created_at', windowStart.toISOString());

    if (error) {
      console.error('Rate limit query failed:', error);
      return false;
    }

    // Log the attempt
    const { error: logError } = await supabase
      .from('user_activity_logs')
      .insert({
        action_type: action,
        action_description: `Rate limit check for ${action}`,
        metadata: { identifier },
        created_at: now.toISOString()
      });

    if (logError) {
      console.error('Failed to log rate limit attempt:', logError);
    }

    // Check if we're under the limit
    return (data?.length ?? 0) < max;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return false;
  }
}

// Rest of the file remains unchanged
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    console.error('Invalid input type for sanitization');
    return '';
  }
  return input.replace(/[<>]/g, '');
}

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }
  const phoneRegex = /^\+?[\d\s-()]{10,}$/;
  return phoneRegex.test(phone);
}

export async function validateCredentials(role: string, credentials: any): Promise<boolean> {
  if (!role || !credentials) {
    return false;
  }

  try {
    switch (role) {
      case 'attorney':
        return validateBarNumber(credentials?.barNumber);
      case 'court_reporter':
        return validateCertificationNumber(credentials?.certificationNumber);
      default:
        return true;
    }
  } catch (error) {
    console.error('Credential validation failed:', error);
    return false;
  }
}

async function validateBarNumber(barNumber?: string): Promise<boolean> {
  if (!barNumber) return false;
  return /^[A-Z0-9]{5,}$/.test(barNumber);
}

async function validateCertificationNumber(certNumber?: string): Promise<boolean> {
  if (!certNumber) return false;
  return /^[A-Z0-9]{6,}$/.test(certNumber);
}