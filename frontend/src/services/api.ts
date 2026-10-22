// API Service Layer for Faculty Feedback System
// Automatically detects GitHub Pages or offline mode and provides complete standalone demo functionality.

import { mockBackend } from './mockService';

const isGitHubPages = typeof window !== 'undefined' && (
  window.location.hostname.includes('github.io') ||
  window.location.protocol === 'file:'
);

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

function getAnonymousToken(): string {
  let token = localStorage.getItem('anonymousToken');
  if (!token) {
    token = 'anon_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem('anonymousToken', token);
  }
  return token;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  headers['x-anonymous-token'] = getAnonymousToken();

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  
  let data: any;
  try {
    data = await res.json();
  } catch {
    const error = new Error(`Network response error (status ${res.status})`) as Error & { status: number };
    error.status = res.status;
    throw error;
  }

  if (!res.ok) {
    const error = new Error(data.error || 'Request failed') as Error & { status: number };
    error.status = res.status;
    throw error;
  }

  return data;
}

async function withFallback<T>(
  networkFn: () => Promise<T>,
  mockFn: () => Promise<T>
): Promise<T> {
  if (isGitHubPages) {
    return mockFn();
  }
  try {
    return await networkFn();
  } catch (err: any) {
    // If backend is down, returns 404/500/502/503/504, or fetch fails, gracefully use mock demo mode
    if (
      err?.name === 'TypeError' ||
      err?.name === 'SyntaxError' ||
      err?.status === 404 ||
      err?.status === 500 ||
      err?.status === 502 ||
      err?.status === 503 ||
      err?.status === 504 ||
      !navigator.onLine ||
      (err?.message && (
        err.message.includes('fetch') ||
        err.message.includes('Network') ||
        err.message.includes('ECONNREFUSED') ||
        err.message.includes('status 5') ||
        err.message.includes('status 404')
      ))
    ) {
      console.info('Backend unavailable or offline, using client-side demo mode:', err?.message || err);
      return mockFn();
    }
    throw err;
  }
}

// Auth
export const authAPI = {
  login: (username: string, password: string) =>
    withFallback(
      () =>
        request<{ success: boolean; token: string; user: any }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        }),
      () => mockBackend.login(username, password)
    ),

  forgotPassword: (username: string) =>
    withFallback(
      () =>
        request<{ success: boolean; message: string; verificationCode?: string; role?: string; name?: string }>(
          '/auth/forgot-password',
          {
            method: 'POST',
            body: JSON.stringify({ username }),
          }
        ),
      () => mockBackend.forgotPassword(username)
    ),

  resetPassword: (payload: { username: string; code: string; newPassword: string }) =>
    withFallback(
      () =>
        request<{ success: boolean; message: string }>('/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify(payload),
        }),
      () => mockBackend.resetPassword(payload)
    ),
};

// Student endpoints
export const studentAPI = {
  getPrograms: () =>
    withFallback(
      () => request<{ data: any[] }>('/programs'),
      () => mockBackend.getPrograms()
    ),

  getSemesters: (program: string) =>
    withFallback(
      () => request<{ data: any[] }>(`/semesters?program=${program}`),
      () => mockBackend.getSemesters(program)
    ),

  getSubjects: (program: string, semester: number) =>
    withFallback(
      () => request<{ data: any[] }>(`/subjects?program=${program}&semester=${semester}`),
      () => mockBackend.getSubjects(program, semester)
    ),

  getFaculty: (subjectId?: string, program?: string, semester?: number) => {
    const params = new URLSearchParams();
    if (subjectId) params.append('subjectId', subjectId);
    if (program) params.append('program', program);
    if (semester) params.append('semester', String(semester));
    const query = params.toString() ? `?${params.toString()}` : '';

    return withFallback(
      () => request<{ data: any[] }>(`/faculty${query}`),
      () => mockBackend.getFaculty(subjectId, program, semester)
    );
  },

  submitFeedback: (payload: any) =>
    withFallback(
      () =>
        request<{ success: boolean; message: string; feedbackId: string }>('/feedback', {
          method: 'POST',
          body: JSON.stringify(payload),
        }),
      () => mockBackend.submitFeedback(payload)
    ),
};

// Faculty endpoints
export const facultyAPI = {
  getMyProfile: () =>
    withFallback(
      () => request<{ data: any }>('/faculty/me'),
      () => mockBackend.getMyProfile()
    ),

  getMyPerformance: () =>
    withFallback(
      () => request<{ data: any }>('/faculty/me/performance'),
      () => mockBackend.getMyPerformance()
    ),
};

// Admin endpoints
export const adminAPI = {
  getDashboard: () =>
    withFallback(
      () => request<{ data: any }>('/admin/dashboard'),
      () => mockBackend.getDashboard()
    ),

  getAllFaculty: () =>
    withFallback(
      () => request<{ data: any[] }>('/admin/faculty'),
      () => mockBackend.getAllFaculty()
    ),

  getFacultyDetail: (id: string) =>
    withFallback(
      () => request<{ data: any }>(`/admin/faculty/${id}/detail`),
      () => mockBackend.getFacultyDetail(id)
    ),

  getAnalytics: () =>
    withFallback(
      () => request<{ data: any }>('/admin/analytics'),
      () => mockBackend.getAnalytics()
    ),

  getFeedback: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return withFallback(
      () => request<{ data: any[]; total: number }>(`/admin/feedback${query}`),
      () => mockBackend.getFeedback(params)
    );
  },

  getReportData: (facultyId?: string) => {
    const query = facultyId ? `?facultyId=${facultyId}` : '';
    return withFallback(
      () => request<{ data: any }>(`/admin/reports/json${query}`),
      () => mockBackend.getReportData(facultyId)
    );
  },

  getSettings: () =>
    withFallback(
      () => request<{ data: any }>('/admin/settings'),
      () => mockBackend.getSettings()
    ),

  updateSettings: (settings: any) =>
    withFallback(
      () =>
        request<{ success: boolean; data: any }>('/admin/settings', {
          method: 'POST',
          body: JSON.stringify(settings),
        }),
      () => mockBackend.updateSettings(settings)
    ),

  getCSVUrl: () => {
    const token = getToken();
    return `${API_BASE}/admin/reports/csv?token=${token}`;
  },

  // Academic Catalog Management CRUD
  getCatalog: () =>
    withFallback(
      () => request<{ success: boolean; data: { programs: any[]; subjects: any[]; faculty: any[] } }>('/admin/catalog'),
      () => mockBackend.getCatalog()
    ),

  createFaculty: (facultyData: {
    name: string;
    designation: string;
    department: string;
    email?: string;
    phone?: string;
    semesters?: number[];
  }) =>
    withFallback(
      () =>
        request<{ success: boolean; message: string; data: any; credentials: { username: string; defaultPassword: string } }>(
          '/admin/faculty',
          {
            method: 'POST',
            body: JSON.stringify(facultyData),
          }
        ),
      () => mockBackend.createFaculty(facultyData)
    ),

  deleteFaculty: (id: string) =>
    withFallback(
      () =>
        request<{ success: boolean; message: string }>(`/admin/faculty/${id}`, {
          method: 'DELETE',
        }),
      () => mockBackend.deleteFaculty(id)
    ),

  createProgram: (programData: {
    name: string;
    degree: string;
    department: string;
    durationYears: number;
    totalSemesters: number;
    code?: string;
  }) =>
    withFallback(
      () =>
        request<{ success: boolean; message: string; data: any }>('/admin/programs', {
          method: 'POST',
          body: JSON.stringify(programData),
        }),
      () => mockBackend.createProgram(programData)
    ),

  deleteProgram: (id: string) =>
    withFallback(
      () =>
        request<{ success: boolean; message: string }>(`/admin/programs/${id}`, {
          method: 'DELETE',
        }),
      () => mockBackend.deleteProgram(id)
    ),

  createSubject: (subjectData: {
    code: string;
    name: string;
    program: string;
    semester: number;
    credits: number;
    facultyId: string;
  }) =>
    withFallback(
      () =>
        request<{ success: boolean; message: string; data: any }>('/admin/subjects', {
          method: 'POST',
          body: JSON.stringify(subjectData),
        }),
      () => mockBackend.createSubject(subjectData)
    ),

  deleteSubject: (id: string) =>
    withFallback(
      () =>
        request<{ success: boolean; message: string }>(`/admin/subjects/${id}`, {
          method: 'DELETE',
        }),
      () => mockBackend.deleteSubject(id)
    ),
};
