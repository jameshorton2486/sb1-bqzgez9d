export type UserRole = 'attorney' | 'court_reporter' | 'legal_staff' | 'administrator' | 'videographer' | 'scopist';

export interface SignUpFormData {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  organization?: string;
}

export interface SignInFormData {
  email: string;
  password: string;
}