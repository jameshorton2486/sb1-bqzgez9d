export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'attorney' | 'court_reporter' | 'legal_staff' | 'administrator' | 'videographer' | 'scopist';
  organization: string | null;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}