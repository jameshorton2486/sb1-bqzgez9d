// Existing imports and types remain...

export interface UserSecuritySettings {
  id: string;
  two_factor_enabled: boolean;
  two_factor_method: 'app' | 'sms' | 'email' | null;
  session_timeout: string;
  ip_whitelist: string[] | null;
  last_security_update: string;
  created_at: string;
  updated_at: string;
}

export interface UserActivityLog {
  id: string;
  user_id: string;
  action_type: string;
  action_description: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  metadata: Record<string, any>;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  ip_address: string | null;
  user_agent: string | null;
  expires_at: string;
  last_activity: string;
  created_at: string;
}

export interface UserEquipment {
  id: string;
  user_id: string;
  equipment_type: string;
  model: string;
  serial_number: string | null;
  purchase_date: string | null;
  last_maintenance_date: string | null;
  status: 'active' | 'maintenance' | 'retired';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserCertification {
  id: string;
  user_id: string;
  certification_name: string;
  issuing_authority: string;
  certification_number: string | null;
  issue_date: string;
  expiry_date: string | null;
  status: 'active' | 'expired' | 'revoked';
  verification_url: string | null;
  created_at: string;
  updated_at: string;
}

// Update Profile interface
export interface Profile {
  // ... existing fields ...
  security_level: 'standard' | 'elevated' | 'admin';
  account_status: 'active' | 'suspended' | 'inactive';
  last_security_training: string | null;
  security_training_due: string | null;
}