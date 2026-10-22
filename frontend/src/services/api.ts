// API Service Layer for Faculty Feedback System
// Handles all HTTP requests with JWT auth header injection

const API_BASE = '/api';

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
  const data = await res.json();

  if (!res.ok) {
    const error = new Error(data.error || 'Request failed') as Error & { status: number };
    error.status = res.status;
    throw error;
  }

  return data;
}

// Auth
export const authAPI = {
  login: (username: string, password: string) =>
    request<{ success: boolean; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  forgotPassword: (username: string) =>
    request<{ success: boolean; message: string; verificationCode?: string; role?: string; name?: string }>(
      '/auth/forgot-password',
      {
        method: 'POST',
        body: JSON.stringify({ username }),
      }
    ),
  resetPassword: (payload: { username: string; code: string; newPassword: string }) =>
    request<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

// Student endpoints
export const studentAPI = {
  getPrograms: () => request<{ data: any[] }>('/programs'),
  getSemesters: (program: string) => request<{ data: any[] }>(`/semesters?program=${program}`),
  getSubjects: (program: string, semester: number) =>
    request<{ data: any[] }>(`/subjects?program=${program}&semester=${semester}`),
  getFaculty: (subjectId?: string, program?: string, semester?: number) => {
    const params = new URLSearchParams();
    if (subjectId) params.append('subjectId', subjectId);
    if (program) params.append('program', program);
    if (semester) params.append('semester', String(semester));
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<{ data: any[] }>(`/faculty${query}`);
  },
  submitFeedback: (payload: any) =>
    request<{ success: boolean; message: string; feedbackId: string }>('/feedback', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

// Faculty endpoints
export const facultyAPI = {
  getMyProfile: () => request<{ data: any }>('/faculty/me'),
  getMyPerformance: () => request<{ data: any }>('/faculty/me/performance'),
};

// Admin endpoints
export const adminAPI = {
  getDashboard: () => request<{ data: any }>('/admin/dashboard'),
  getAllFaculty: () => request<{ data: any[] }>('/admin/faculty'),
  getFacultyDetail: (id: string) => request<{ data: any }>(`/admin/faculty/${id}/detail`),
  getAnalytics: () => request<{ data: any }>('/admin/analytics'),
  getFeedback: (params?: Record<string, string>) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<{ data: any[]; total: number }>(`/admin/feedback${query}`);
  },
  getReportData: (facultyId?: string) => {
    const query = facultyId ? `?facultyId=${facultyId}` : '';
    return request<{ data: any }>(`/admin/reports/json${query}`);
  },
  getSettings: () => request<{ data: any }>('/admin/settings'),
  updateSettings: (settings: any) =>
    request<{ success: boolean; data: any }>('/admin/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    }),
  getCSVUrl: () => {
    const token = getToken();
    return `${API_BASE}/admin/reports/csv?token=${token}`;
  },
  // Academic Catalog Management CRUD
  getCatalog: () =>
    request<{ success: boolean; data: { programs: any[]; subjects: any[]; faculty: any[] } }>('/admin/catalog'),
  createFaculty: (facultyData: {
    name: string;
    designation: string;
    department: string;
    email?: string;
    phone?: string;
    semesters?: number[];
  }) =>
    request<{ success: boolean; message: string; data: any; credentials: { username: string; defaultPassword: string } }>(
      '/admin/faculty',
      {
        method: 'POST',
        body: JSON.stringify(facultyData),
      }
    ),
  deleteFaculty: (id: string) =>
    request<{ success: boolean; message: string }>(`/admin/faculty/${id}`, {
      method: 'DELETE',
    }),
  createProgram: (programData: {
    name: string;
    degree: string;
    department: string;
    durationYears: number;
    totalSemesters: number;
    code?: string;
  }) =>
    request<{ success: boolean; message: string; data: any }>('/admin/programs', {
      method: 'POST',
      body: JSON.stringify(programData),
    }),
  deleteProgram: (id: string) =>
    request<{ success: boolean; message: string }>(`/admin/programs/${id}`, {
      method: 'DELETE',
    }),
  createSubject: (subjectData: {
    code: string;
    name: string;
    program: string;
    semester: number;
    credits: number;
    facultyId: string;
  }) =>
    request<{ success: boolean; message: string; data: any }>('/admin/subjects', {
      method: 'POST',
      body: JSON.stringify(subjectData),
    }),
  deleteSubject: (id: string) =>
    request<{ success: boolean; message: string }>(`/admin/subjects/${id}`, {
      method: 'DELETE',
    }),
};
