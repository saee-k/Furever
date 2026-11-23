import {
  AdminDashboardData,
  AdoptionApplication,
  LostFoundReport,
  NotificationItem,
  Pet,
  PublicStats,
  QuizRecommendation,
  SwipeHistoryItem,
  User,
  VetClinic,
} from '../types';

const TOKEN_KEY = 'furever_jwt_token';

export function getAuthToken(): string {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setAuthToken(token: string): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

/**
 * Helper function that sends HTTP requests from React to our Express API.
 * Automatically attaches the JWT Bearer token when the user is signed in.
 */
async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {};

  if (options.headers) {
    Object.assign(headers, options.headers);
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`/api${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }
  return data as T;
}

export const api = {
  getHealth: () =>
    apiRequest<{ status: string; databaseEngine: string; stats: PublicStats }>('/health'),

  // Authentication & Profile
  login: (email: string, password: string) =>
    apiRequest<{ token: string; user: User; favouriteIds: string[] }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (payload: {
    fullName: string;
    email: string;
    password: string;
    role: string;
    city: string;
  }) =>
    apiRequest<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  logout: () => apiRequest<{ ok: boolean }>('/auth/logout', { method: 'POST' }),

  getMe: () =>
    apiRequest<{ user: User; favouriteIds: string[]; notifications: NotificationItem[] }>('/auth/me'),

  updateProfile: (payload: {
    fullName: string;
    phone: string;
    city: string;
    housingType: string;
    bio?: string;
  }) =>
    apiRequest<{ user: User }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // Pets
  listPets: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, value]) => value && value !== 'All')
    ).toString();
    return apiRequest<{ pets: Pet[] }>(`/pets${query ? `?${query}` : ''}`);
  },

  getPet: (id: string) => apiRequest<{ pet: Pet }>(`/pets/${encodeURIComponent(id)}`),

  createPet: (formData: FormData) =>
    apiRequest<{ pet: Pet }>('/pets', {
      method: 'POST',
      body: formData,
    }),

  updatePetStatus: (id: string, status: string) =>
    apiRequest<{ ok: boolean; status: string }>(`/pets/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  deletePet: (id: string) =>
    apiRequest<{ ok: boolean }>(`/pets/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // Favourites, Swipes & Quiz
  toggleFavorite: (petId: string) =>
    apiRequest<{ liked: boolean; petIds: string[] }>('/favorites/toggle', {
      method: 'POST',
      body: JSON.stringify({ petId }),
    }),

  recordSwipe: (petId: string, action: 'like' | 'pass') =>
    apiRequest<{ ok: boolean; petIds: string[] }>('/swipes', {
      method: 'POST',
      body: JSON.stringify({ petId, action }),
    }),

  getSwipeHistory: () => apiRequest<{ history: SwipeHistoryItem[] }>('/swipes/history'),

  submitQuiz: (answers: Record<string, string>) =>
    apiRequest<{ recommendations: QuizRecommendation[] }>('/quiz/recommend', {
      method: 'POST',
      body: JSON.stringify(answers),
    }),

  // Adoption Applications
  listApplications: () => apiRequest<{ applications: AdoptionApplication[] }>('/applications'),

  submitApplication: (payload: Record<string, unknown>) =>
    apiRequest<{
      application: AdoptionApplication;
      eligibility: { result: string; reason: string };
    }>('/applications', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateApplicationStatus: (id: string, status: string, reviewerNotes = '') =>
    apiRequest<{ application: AdoptionApplication }>(
      `/applications/${encodeURIComponent(id)}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status, reviewerNotes }),
      }
    ),

  // Lost & Found
  listLostFound: () => apiRequest<{ reports: LostFoundReport[] }>('/lost-found'),

  createLostFound: (formData: FormData) =>
    apiRequest<{ report: LostFoundReport }>('/lost-found', {
      method: 'POST',
      body: formData,
    }),

  updateLostFoundStatus: (id: string, status: string) =>
    apiRequest<{ report: LostFoundReport }>(`/lost-found/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Veterinary Clinics
  listVets: () => apiRequest<{ vets: VetClinic[] }>('/vets'),

  createVet: (payload: Record<string, string>) =>
    apiRequest<{ vet: VetClinic }>('/vets', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  deleteVet: (id: string) =>
    apiRequest<{ ok: boolean }>(`/admin/vets/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // Admin
  getAdminDashboard: () => apiRequest<AdminDashboardData>('/admin/dashboard'),

  updateAdminUser: (id: string, payload: { is_active?: boolean; role?: string }) =>
    apiRequest<{ user: User }>(`/admin/users/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
};
