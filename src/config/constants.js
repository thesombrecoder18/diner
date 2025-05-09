// API URL - Points to the Express server
export const API_URL = 'http://localhost:3001/api';

// Database Configuration
export const DB_CONFIG = {
  host: 'mysql-bayeeli.alwaysdata.net',
  user: 'bayeeli_ka',
  password: 'modoubeignet10',
  database: 'bayeeli_diner'
};

// Default king/queen photos if none provided
export const DEFAULT_KING_PHOTO = 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800';
export const DEFAULT_QUEEN_PHOTO = 'https://images.pexels.com/photos/2681751/pexels-photo-2681751.jpeg?auto=compress&cs=tinysrgb&w=800';
export const JWT_SECRET="dgqfX6Ctfn2Y5j2jRagWsssVNvehb9MhQjMgsNc7FsE=";
// Chart colors
export const CHART_COLORS = {
  kings: [
    'rgba(128, 0, 32, 0.8)',    // burgundy
    'rgba(148, 20, 52, 0.8)',
    'rgba(168, 40, 72, 0.8)',
    'rgba(188, 60, 92, 0.8)',
    'rgba(208, 80, 112, 0.8)',
    'rgba(228, 100, 132, 0.8)',
  ],
  queens: [
    'rgba(212, 175, 55, 0.8)',  // gold
    'rgba(222, 185, 65, 0.8)',
    'rgba(232, 195, 75, 0.8)',
    'rgba(242, 205, 85, 0.8)',
    'rgba(252, 215, 95, 0.8)',
    'rgba(255, 225, 105, 0.8)',
  ],
};

// Animation durations
export const ANIMATION = {
  short: 300,
  medium: 500,
  long: 800,
};