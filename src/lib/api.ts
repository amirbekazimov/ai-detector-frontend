import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  throw new Error('VITE_API_URL environment variable is required');
}

// Debug: Log the API URL being used
console.log('🌐 API Base URL:', API_BASE_URL);
console.log('🔧 Environment:', import.meta.env.MODE);

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/api/v1/auth/login', { email, password }),
  register: (email: string, username: string, password: string) =>
    api.post('/api/v1/auth/register', { email, username, password }),
};

// Sites API
export const sitesApi = {
  getSites: () => api.get('/api/v1/sites'),
  createSite: (name: string, domain: string) => api.post('/api/v1/sites', { name, domain }),
  deleteSite: (siteId: string) => api.delete(`/api/v1/sites/${siteId}`),
  getSnippet: (siteId: string) => api.get(`/api/v1/sites/${siteId}/snippet`),
};

// Dashboard API
export const dashboardApi = {
  getSitesWithStats: () => api.get('/api/v1/dashboard/sites'),
  getSiteStats: (siteId: string, days: number = 7) =>
    api.get(`/api/v1/dashboard/stats/${siteId}?days=${days}`),
  getSiteVisits: (siteId: string, days: number = 7, limit: number = 50, offset: number = 0, botType?: string) =>
    api.get(`/api/v1/dashboard/visits/${siteId}?days=${days}&limit=${limit}&offset=${offset}${botType ? `&bot_type=${botType}` : ''}`),
  getDailyStats: (siteId: string, days: number = 7) =>
    api.get(`/api/v1/dashboard/daily-stats/${siteId}?days=${days}`),
  getBotTypesStats: (siteId: string, days: number = 7) =>
    api.get(`/api/v1/dashboard/bot-types/${siteId}?days=${days}`),
};

// Types
export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
}

export interface Site {
  id: string;
  site_id?: string;
  name: string;
  domain: string;
  created_at: string;
  total_events?: number;
  ai_bot_events?: number;
  human_events?: number;
  ai_bot_percentage?: number;
}

export interface VisitEvent {
  id: number;
  site_id: string;
  event_type: string;
  url: string;
  path: string;
  title: string;
  referrer: string;
  user_agent: string;
  ip_address: string;
  screen_resolution: string;
  viewport_size: string;
  language: string;
  timezone: string;
  is_ai_bot: string | boolean;
  bot_name: string | null;
  timestamp: string;
  created_at: string;
}

export interface SiteStats {
  total_events: number;  // Backend возвращает total_events
  ai_bot_events: number; // Backend возвращает ai_bot_events
  human_events: number;  // Backend возвращает human_events
  ai_bot_percentage: number;
  unique_visitors: number;
  bot_types: Record<string, number>; // New: bot types distribution
  events_by_type: Record<string, number>; // New: events by type
  top_pages: Array<{
    path: string;
    visits: number;
  }>;
  top_bots: Array<{
    bot_name: string;
    visits: number;
  }>;
}

export interface DailyStats {
  date: string;
  total_events: number;  // Backend возвращает total_events
  ai_bot_events: number; // Backend возвращает ai_bot_events
  human_events: number;  // Backend возвращает human_events
  ai_bot_percentage?: number;
}

export interface BotTypesStats {
  site_id: string;
  domain: string;
  period_days: number;
  bot_types: Record<string, number>;
  daily_bot_types: Record<string, Record<string, number>>;
}
