import { z } from 'zod';
import { supabase } from './supabase';

// Email validation schema
export const emailSchema = z
  .string()
  .email("Please enter a valid email address")
  .min(1, "Please enter your email address");

// Password validation schema
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

// Validation result interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export async function validateLoginCredentials(
  email: string | undefined,
  password: string | undefined
): Promise<ValidationResult> {
  const errors: string[] = [];

  // Check for empty values first
  if (!email) {
    errors.push("Please enter your email address");
  }
  if (!password) {
    errors.push("Please enter your password");
  }
  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  try {
    // Validate email
    emailSchema.parse(email);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(e => e.message));
    }
  }

  try {
    // Validate password
    passwordSchema.parse(password);
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.push(...error.errors.map(e => e.message));
    }
  }

  // Check account status if email/password are valid
  if (errors.length === 0) {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('account_status')
        .eq('email', email)
        .single();

      if (!profile) {
        errors.push("No account found with this email address");
      } else if (profile.account_status === 'suspended') {
        errors.push("Your account has been suspended. Please contact support");
      } else if (profile.account_status === 'inactive') {
        errors.push("Your account is inactive. Please contact support");
      }
    } catch (error) {
      console.error('Error checking account status:', error);
      errors.push("An error occurred while validating your account");
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}