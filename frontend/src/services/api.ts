import {
  User,
  UserProfile,
  Workout,
  WorkoutSummary,
  DashboardTelemetry,
  FitnessGoal,
  ActivityHistoryItem,
  UserConsentOverview,
  ReceiptRead,
  ReceiptVerifyResult,
  ConsumerAccessResponse,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const TOKEN_KEY = 'fitpulse_jwt_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    // ignore
  }
}

async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(url, { ...options, headers });
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const errJson = await res.json();
      errorMsg = errJson.detail || errJson.message || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }
  if (res.status === 204) {
    return {} as T;
  }
  return res.json();
}

export const api = {
  // Auth
  async login(username_or_email: string, password: string): Promise<{ access_token: string; user: User }> {
    const res = await apiFetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ username_or_email, password }),
    });
    const data = await handleResponse<{ access_token: string; user: User }>(res);
    setStoredToken(data.access_token);
    return data;
  },

  async register(name: string, email: string, password: string): Promise<{ access_token: string; user: User }> {
    const res = await apiFetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    const data = await handleResponse<{ access_token: string; user: User }>(res);
    setStoredToken(data.access_token);
    return data;
  },

  async getMe(): Promise<User> {
    const res = await apiFetch(`${API_BASE}/api/auth/me`);
    return handleResponse<User>(res);
  },

  logout(): void {
    setStoredToken(null);
  },

  // Workouts
  async getWorkouts(category?: string): Promise<Workout[]> {
    const url = category ? `${API_BASE}/api/workouts?category=${encodeURIComponent(category)}` : `${API_BASE}/api/workouts`;
    const res = await apiFetch(url);
    return handleResponse<Workout[]>(res);
  },

  async createWorkout(data: Partial<Workout>): Promise<Workout> {
    const res = await apiFetch(`${API_BASE}/api/workouts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse<Workout>(res);
  },

  async updateWorkout(id: number, data: Partial<Workout>): Promise<Workout> {
    const res = await apiFetch(`${API_BASE}/api/workouts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleResponse<Workout>(res);
  },

  async deleteWorkout(id: number): Promise<void> {
    const res = await apiFetch(`${API_BASE}/api/workouts/${id}`, { method: 'DELETE' });
    return handleResponse<void>(res);
  },

  async getWorkoutSummary(): Promise<WorkoutSummary> {
    const res = await apiFetch(`${API_BASE}/api/workouts/summary`);
    return handleResponse<WorkoutSummary>(res);
  },

  // Dashboard Analytics
  async getDashboard(): Promise<DashboardTelemetry> {
    const res = await apiFetch(`${API_BASE}/api/analytics/dashboard`);
    return handleResponse<DashboardTelemetry>(res);
  },

  // Profile & Goals
  async getProfile(): Promise<UserProfile> {
    const res = await apiFetch(`${API_BASE}/api/profile`);
    return handleResponse<UserProfile>(res);
  },

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const res = await apiFetch(`${API_BASE}/api/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleResponse<UserProfile>(res);
  },

  async getGoals(): Promise<FitnessGoal[]> {
    const res = await apiFetch(`${API_BASE}/api/profile/goals`);
    return handleResponse<FitnessGoal[]>(res);
  },

  async createGoal(data: Partial<FitnessGoal>): Promise<FitnessGoal> {
    const res = await apiFetch(`${API_BASE}/api/profile/goals`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return handleResponse<FitnessGoal>(res);
  },

  async updateGoal(id: number, data: Partial<FitnessGoal>): Promise<FitnessGoal> {
    const res = await apiFetch(`${API_BASE}/api/profile/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return handleResponse<FitnessGoal>(res);
  },

  async deleteGoal(id: number): Promise<void> {
    const res = await apiFetch(`${API_BASE}/api/profile/goals/${id}`, { method: 'DELETE' });
    return handleResponse<void>(res);
  },

  async getActivityHistory(): Promise<ActivityHistoryItem[]> {
    const res = await apiFetch(`${API_BASE}/api/profile/activity`);
    return handleResponse<ActivityHistoryItem[]>(res);
  },

  // AIORI-3 Consent Operations
  async getConsentOverview(lang: string = 'en'): Promise<UserConsentOverview> {
    const res = await apiFetch(`${API_BASE}/api/consent/overview?lang=${lang}`);
    return handleResponse<UserConsentOverview>(res);
  },

  async grantConsent(purpose_id: string, language: string = 'en'): Promise<any> {
    const res = await apiFetch(`${API_BASE}/api/consent/grant`, {
      method: 'POST',
      body: JSON.stringify({ purpose_id, language }),
    });
    return handleResponse<any>(res);
  },

  async withdrawConsent(purpose_id: string, language: string = 'en'): Promise<any> {
    const res = await apiFetch(`${API_BASE}/api/consent/withdraw`, {
      method: 'POST',
      body: JSON.stringify({ purpose_id, language }),
    });
    return handleResponse<any>(res);
  },

  async getReceipts(): Promise<ReceiptRead[]> {
    const res = await apiFetch(`${API_BASE}/api/consent/receipts`);
    return handleResponse<ReceiptRead[]>(res);
  },

  async verifyReceipt(receipt_id: string): Promise<ReceiptVerifyResult> {
    const res = await apiFetch(`${API_BASE}/api/consent/receipts/${receipt_id}/verify`);
    return handleResponse<ReceiptVerifyResult>(res);
  },

  // Consumer Access Simulation
  async simulateConsumerAccess(purpose: string, override_api_key?: string): Promise<ConsumerAccessResponse> {
    const res = await apiFetch(`${API_BASE}/api/consumer/test-access`, {
      method: 'POST',
      body: JSON.stringify({ purpose, override_api_key }),
    });
    return handleResponse<ConsumerAccessResponse>(res);
  },

  // Admin
  async getAdminStats(): Promise<any> {
    const res = await apiFetch(`${API_BASE}/api/admin/stats`);
    return handleResponse<any>(res);
  },

  async getAdminUsers(): Promise<any[]> {
    const res = await apiFetch(`${API_BASE}/api/admin/users`);
    return handleResponse<any[]>(res);
  },

  async getAdminIntegrationEvents(limit: number = 50): Promise<any[]> {
    const res = await apiFetch(`${API_BASE}/api/admin/integration-events?limit=${limit}`);
    return handleResponse<any[]>(res);
  },

  async getAdminCurrentNotice(lang: string = 'en'): Promise<any> {
    const res = await apiFetch(`${API_BASE}/api/admin/notices/current?lang=${lang}`);
    return handleResponse<any>(res);
  },

  async publishNoticeRevision(payload: {
    version: string;
    title: string;
    content: string;
    language?: string;
  }): Promise<any> {
    const res = await apiFetch(`${API_BASE}/api/admin/notices/publish`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },
};

