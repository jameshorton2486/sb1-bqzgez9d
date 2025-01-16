// Update config.ts to remove Deepgram settings
const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  security: {
    maxLoginAttempts: Number(import.meta.env.VITE_MAX_LOGIN_ATTEMPTS) || 5,
    loginTimeoutMinutes: Number(import.meta.env.VITE_LOGIN_TIMEOUT_MINUTES) || 15,
    sessionTimeoutMinutes: Number(import.meta.env.VITE_SESSION_TIMEOUT_MINUTES) || 30,
    require2FA: import.meta.env.VITE_REQUIRE_2FA === 'true',
  },
  audio: {
    maxFileSize: 500 * 1024 * 1024, // 500MB
    supportedFormats: ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/webm', 'video/webm'],
    sampleRate: 44100,
    channels: 1,
    defaultEnhancementOptions: {
      noiseReduction: 0.5,
      speechEnhancement: 0.5,
      dereverberation: true,
      volumeNormalization: -14
    }
  }
};

// Validate required environment variables
const requiredVars = [
  ['VITE_SUPABASE_URL', config.supabase.url],
  ['VITE_SUPABASE_ANON_KEY', config.supabase.anonKey],
];

for (const [name, value] of requiredVars) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
}

export default config;