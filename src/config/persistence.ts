export type PersistenceMode = 'api' | 'local';

const modeFromEnv = (import.meta.env.VITE_PERSISTENCE_MODE || 'local').toLowerCase();

export const PERSISTENCE_MODE: PersistenceMode =
  modeFromEnv === 'api' ? 'api' : 'local';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const IS_LOCAL_DEMO_MODE = PERSISTENCE_MODE === 'local';
