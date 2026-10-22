// Client-Side Mock Service for GitHub Pages and Offline Demo Mode
// Provides fully-functional in-browser persistence using localStorage.

import rawUsers from '../data/users.json';
import rawPrograms from '../data/programs.json';
import rawSubjects from '../data/subjects.json';
import rawFaculty from '../data/faculty.json';
import rawFeedback from '../data/feedback.json';
import rawSettings from '../data/settings.json';

const STORAGE_KEYS = {
  USERS: 'ffa_users',
  PROGRAMS: 'ffa_programs',
  SUBJECTS: 'ffa_subjects',
  FACULTY: 'ffa_faculty',
  FEEDBACK: 'ffa_feedback',
  SETTINGS: 'ffa_settings',
  INIT: 'ffa_initialized_v2',
};

function getStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

// Initialize seed data if not present
export function initMockStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.INIT)) {
    setStorage(STORAGE_KEYS.USERS, rawUsers);
    setStorage(STORAGE_KEYS.PROGRAMS, rawPrograms);
    setStorage(STORAGE_KEYS.SUBJECTS, rawSubjects);
    setStorage(STORAGE_KEYS.FACULTY, rawFaculty);
    setStorage(STORAGE_KEYS.FEEDBACK, rawFeedback);
    setStorage(STORAGE_KEYS.SETTINGS, rawSettings);
    localStorage.setItem(STORAGE_KEYS.INIT, 'true');
  }
}

// Ensure initialized
initMockStorage();

const RATING_PARAMS = [
  'subjectKnowledge', 'clarity', 'communication', 'engagement',
  'punctuality', 'doubtResolution', 'practicalExamples', 'overallSatisfaction'
];

const PARAM_LABELS: Record<string, string> = {
  subjectKnowledge: 'Subject Knowledge',
  clarity: 'Explanation / Clarity',
  communication: 'Communication',
  engagement: 'Student Engagement',
  punctuality: 'Punctuality',
  doubtResolution: 'Doubt Resolution',
  practicalExamples: 'Practical / Real-world Examples',
  overallSatisfaction: 'Overall Satisfaction'
};

function getPerformanceCategory(avgRating: number, feedbackCount: number, minThreshold: number): string {
  if (feedbackCount < minThreshold) return 'Insufficient Responses';
  if (avgRating >= 4.2) return 'Top Rated Faculty';
  if (avgRating >= 3.8) return 'Strong Performance';
  if (avgRating >= 3.5) return 'Good Performance';
  return 'Needs Improvement';
}

function getCategoryColor(category: string): string {
  switch (category) {
    case 'Top Rated Faculty': return '#059669';
    case 'Strong Performance': return '#2563eb';
    case 'Good Performance': return '#7c3aed';
    case 'Needs Improvement': return '#d97706';
    case 'Insufficient Responses': return '#64748b';
    default: return '#64748b';
  }
}

function calculateFacultyPerformance(facultyId: string) {
  const feedbacks = getStorage<any[]>(STORAGE_KEYS.FEEDBACK, rawFeedback);
  const settings = getStorage<any>(STORAGE_KEYS.SETTINGS, rawSettings);
  const subjects = getStorage<any[]>(STORAGE_KEYS.SUBJECTS, rawSubjects);
  const faculty = getStorage<any[]>(STORAGE_KEYS.FACULTY, rawFaculty);

  const fac = faculty.find(f => f.id === facultyId);
  if (!fac) return null;

  const facFeedback = feedbacks.filter(fb => fb.facultyId === facultyId);
  const totalResponses = facFeedback.length;

  if (totalResponses === 0) {
    return {
      faculty: fac,
      totalResponses: 0,
      overallAverage: 0,
      category: 'Insufficient Responses',
      categoryColor: '#64748b',
      parameterAverages: {},
      subjectStats: [],
      trendData: [],
      themes: { strengths: [], improvements: [] },
      _commentSentiments: []
    };
  }

  const paramAverages: Record<string, any> = {};
  let totalRatingSum = 0;
  let totalRatingCount = 0;

  for (const p of RATING_PARAMS) {
    const values = facFeedback.map(fb => fb.ratings?.[p]).filter(v => v != null);
    const avg = values.length > 0 ? parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)) : 0;
    paramAverages[p] = { key: p, label: PARAM_LABELS[p], average: avg, count: values.length };
    totalRatingSum += values.reduce((a, b) => a + b, 0);
    totalRatingCount += values.length;
  }

  const overallAverage = totalRatingCount > 0 ? parseFloat((totalRatingSum / totalRatingCount).toFixed(2)) : 0;
  const category = getPerformanceCategory(overallAverage, totalResponses, settings.minimumResponsesForRanking || 3);
  const categoryColor = getCategoryColor(category);

  // Subject breakdown
  const subMap: Record<string, any> = {};
  for (const fb of facFeedback) {
    if (!subMap[fb.subjectId]) {
      const s = subjects.find(sub => sub.id === fb.subjectId);
      subMap[fb.subjectId] = {
        subjectId: fb.subjectId,
        subjectName: s ? s.name : 'Unknown',
        subjectCode: s ? s.code : '',
        semester: fb.semester,
        totalResponses: 0,
        ratingsSum: 0,
        ratingsCount: 0
      };
    }
    const vals = Object.values(fb.ratings || {}) as number[];
    subMap[fb.subjectId].totalResponses++;
    subMap[fb.subjectId].ratingsSum += vals.reduce((a, b) => a + b, 0);
    subMap[fb.subjectId].ratingsCount += vals.length;
  }

  const subjectStats = Object.values(subMap).map(s => ({
    ...s,
    averageRating: s.ratingsCount > 0 ? parseFloat((s.ratingsSum / s.ratingsCount).toFixed(2)) : 0
  }));

  // Trends
  const trendData = [
    { period: 'Month 1', average: Math.max(1, overallAverage - 0.2) },
    { period: 'Month 2', average: Math.max(1, overallAverage - 0.1) },
    { period: 'Month 3', average: overallAverage },
  ];

  return {
    faculty: fac,
    totalResponses,
    overallAverage,
    category,
    categoryColor,
    parameterAverages: paramAverages,
    subjectStats,
    trendData,
    themes: {
      strengths: ['Clear explanations', 'Strong subject knowledge', 'Good communication'],
      improvements: ['More real-world case studies', 'Pace of delivery']
    },
    _commentSentiments: facFeedback.map(fb => ({
      feedbackId: fb.feedbackId,
      positiveComment: fb.positiveComment,
      improvementComment: fb.improvementComment,
      submittedAt: fb.submittedAt
    }))
  };
}

export const mockBackend = {
  // Auth
  async login(username: string, password: string) {
    const users = getStorage<any[]>(STORAGE_KEYS.USERS, rawUsers);
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
      throw new Error('Invalid credentials. (Hint: student1/student123, faculty1/faculty123, admin/admin123)');
    }
    const token = 'mock_jwt_token_' + btoa(JSON.stringify(user));
    return {
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        facultyId: user.facultyId,
        program: user.program,
        semester: user.semester
      }
    };
  },

  async forgotPassword(username: string) {
    return {
      success: true,
      message: 'OTP Code generated successfully for demo mode',
      verificationCode: '123456',
      role: 'student',
      name: username
    };
  },

  async resetPassword(payload: { username: string; code: string; newPassword: string }) {
    const users = getStorage<any[]>(STORAGE_KEYS.USERS, rawUsers);
    const user = users.find(u => u.username === payload.username);
    if (user) {
      user.password = payload.newPassword;
      setStorage(STORAGE_KEYS.USERS, users);
    }
    return { success: true, message: 'Password reset successfully.' };
  },

  // Student Endpoints
  async getPrograms() {
    const programs = getStorage<any[]>(STORAGE_KEYS.PROGRAMS, rawPrograms);
    return { data: programs };
  },

  async getSemesters(programId: string) {
    const programs = getStorage<any[]>(STORAGE_KEYS.PROGRAMS, rawPrograms);
    const prog = programs.find(p => p.id === programId || p.name === programId || p.code === programId);
    const total = prog?.totalSemesters || 6;
    const semesters = [];
    for (let i = 1; i <= total; i++) {
      semesters.push({ id: i, name: `Semester ${i}` });
    }
    return { data: semesters };
  },

  async getSubjects(programId: string, semester: number) {
    const subjects = getStorage<any[]>(STORAGE_KEYS.SUBJECTS, rawSubjects);
    const programs = getStorage<any[]>(STORAGE_KEYS.PROGRAMS, rawPrograms);
    const progObj = programs.find(p => p.id === programId || p.code === programId || p.name === programId);
    const targetProgramName = progObj ? progObj.name : programId;

    let filtered = subjects;
    if (programId) {
      filtered = filtered.filter(s => s.program === targetProgramName || s.program === programId);
    }
    if (semester) {
      filtered = filtered.filter(s => s.semester === Number(semester));
    }
    return { data: filtered };
  },

  async getFaculty(subjectId?: string, program?: string, semester?: number) {
    const faculty = getStorage<any[]>(STORAGE_KEYS.FACULTY, rawFaculty);
    const subjects = getStorage<any[]>(STORAGE_KEYS.SUBJECTS, rawSubjects);

    if (subjectId) {
      const sub = subjects.find(s => s.id === subjectId);
      if (sub && sub.facultyId) {
        const fac = faculty.find(f => f.id === sub.facultyId);
        if (fac) return { data: [fac] };
      }
    }
    return { data: faculty.slice(0, 10) };
  },

  async submitFeedback(payload: any) {
    const feedbacks = getStorage<any[]>(STORAGE_KEYS.FEEDBACK, rawFeedback);
    const newFeedback = {
      feedbackId: 'fb_' + Math.random().toString(36).substring(2, 10),
      facultyId: payload.facultyId,
      subjectId: payload.subjectId,
      semester: Number(payload.semester),
      branch: payload.branch || payload.program || 'general',
      ratings: payload.ratings,
      positiveComment: payload.positiveComment || '',
      improvementComment: payload.improvementComment || '',
      submittedAt: new Date().toISOString()
    };
    feedbacks.unshift(newFeedback);
    setStorage(STORAGE_KEYS.FEEDBACK, feedbacks);
    return {
      success: true,
      message: 'Feedback submitted successfully (stored anonymously).',
      feedbackId: newFeedback.feedbackId
    };
  },

  // Faculty Endpoints
  async getMyProfile() {
    const token = localStorage.getItem('token') || '';
    let facultyId = 'FAC001';
    try {
      if (token.startsWith('mock_jwt_token_')) {
        const user = JSON.parse(atob(token.replace('mock_jwt_token_', '')));
        if (user.facultyId) facultyId = user.facultyId;
      }
    } catch {}

    const perf = calculateFacultyPerformance(facultyId);
    return {
      data: {
        profile: perf?.faculty,
        totalResponses: perf?.totalResponses || 0,
        overallAverage: perf?.overallAverage || 0,
        category: perf?.category || 'Top Rated Faculty',
        categoryColor: perf?.categoryColor || '#059669'
      }
    };
  },

  async getMyPerformance() {
    const token = localStorage.getItem('token') || '';
    let facultyId = 'FAC001';
    try {
      if (token.startsWith('mock_jwt_token_')) {
        const user = JSON.parse(atob(token.replace('mock_jwt_token_', '')));
        if (user.facultyId) facultyId = user.facultyId;
      }
    } catch {}

    const perf = calculateFacultyPerformance(facultyId);
    return {
      data: {
        profile: perf?.faculty,
        totalResponses: perf?.totalResponses,
        overallAverage: perf?.overallAverage,
        category: perf?.category,
        categoryColor: perf?.categoryColor,
        parameterAverages: perf?.parameterAverages,
        subjectStats: perf?.subjectStats,
        trendData: perf?.trendData,
        commonStrengths: perf?.themes.strengths,
        commonImprovements: perf?.themes.improvements
      }
    };
  },

  // Admin Endpoints
  async getDashboard() {
    const feedbacks = getStorage<any[]>(STORAGE_KEYS.FEEDBACK, rawFeedback);
    const faculty = getStorage<any[]>(STORAGE_KEYS.FACULTY, rawFaculty);
    const subjects = getStorage<any[]>(STORAGE_KEYS.SUBJECTS, rawSubjects);
    const settings = getStorage<any>(STORAGE_KEYS.SETTINGS, rawSettings);

    const totalFeedback = feedbacks.length;
    const totalFaculty = faculty.length;
    const totalSubjects = subjects.length;

    let systemRatingSum = 0;
    let systemRatingCount = 0;
    for (const fb of feedbacks) {
      const vals = Object.values(fb.ratings || {}) as number[];
      if (vals.length) {
        systemRatingSum += vals.reduce((a, b) => a + b, 0) / vals.length;
        systemRatingCount++;
      }
    }
    const systemAverage = systemRatingCount > 0 ? parseFloat((systemRatingSum / systemRatingCount).toFixed(2)) : 0;

    const facultyStats = faculty.map(fac => {
      const perf = calculateFacultyPerformance(fac.id);
      return {
        id: fac.id,
        name: fac.name,
        designation: fac.designation,
        department: fac.department,
        totalResponses: perf?.totalResponses || 0,
        overallAverage: perf?.overallAverage || 0,
        category: perf?.category || 'Insufficient Responses',
        categoryColor: perf?.categoryColor || '#64748b'
      };
    });

    facultyStats.sort((a, b) => b.overallAverage - a.overallAverage);

    const topRatedCount = facultyStats.filter(f => f.category === 'Top Rated Faculty').length;
    const needsImprovementCount = facultyStats.filter(f => f.category === 'Needs Improvement').length;

    const deptMap: Record<string, any> = {};
    for (const fac of facultyStats) {
      if (!deptMap[fac.department]) {
        deptMap[fac.department] = { department: fac.department, totalRating: 0, count: 0 };
      }
      if (fac.totalResponses >= (settings.minimumResponsesForRanking || 3)) {
        deptMap[fac.department].totalRating += fac.overallAverage;
        deptMap[fac.department].count++;
      }
    }
    const departmentAverages = Object.values(deptMap).map(d => ({
      department: d.department,
      average: d.count > 0 ? parseFloat((d.totalRating / d.count).toFixed(2)) : 0
    }));

    const paramSysAvg: Record<string, any> = {};
    for (const p of RATING_PARAMS) {
      const values = feedbacks.map(fb => fb.ratings?.[p]).filter(v => v != null);
      paramSysAvg[p] = {
        key: p,
        label: PARAM_LABELS[p],
        average: values.length > 0 ? parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)) : 0
      };
    }

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const fb of feedbacks) {
      const vals = Object.values(fb.ratings || {}) as number[];
      if (vals.length) {
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        const rounded = Math.min(5, Math.max(1, Math.round(avg)));
        distribution[rounded] = (distribution[rounded] || 0) + 1;
      }
    }

    const semesterMap: Record<string, any> = {};
    for (const fb of feedbacks) {
      const sem = `Semester ${fb.semester}`;
      if (!semesterMap[sem]) semesterMap[sem] = { semester: sem, totalRating: 0, count: 0 };
      const vals = Object.values(fb.ratings || {}) as number[];
      if (vals.length) {
        semesterMap[sem].totalRating += vals.reduce((a, b) => a + b, 0) / vals.length;
        semesterMap[sem].count++;
      }
    }

    return {
      data: {
        totalFeedback,
        totalFaculty,
        totalSubjects,
        systemAverage,
        topRatedCount,
        needsImprovementCount,
        facultyRankings: facultyStats,
        topFaculty: facultyStats.slice(0, 5),
        bottomFaculty: facultyStats.filter(f => f.category === 'Needs Improvement').slice(0, 5),
        departmentAverages,
        parameterAverages: paramSysAvg,
        ratingDistribution: Object.entries(distribution).map(([rating, count]) => ({ rating: `${rating} Stars`, count })),
        semesterAverages: Object.values(semesterMap).map(s => ({
          semester: s.semester,
          average: s.count > 0 ? parseFloat((s.totalRating / s.count).toFixed(2)) : 0
        }))
      }
    };
  },

  async getAllFaculty() {
    const faculty = getStorage<any[]>(STORAGE_KEYS.FACULTY, rawFaculty);
    const subjects = getStorage<any[]>(STORAGE_KEYS.SUBJECTS, rawSubjects);

    const enriched = faculty.map(fac => {
      const perf = calculateFacultyPerformance(fac.id);
      return {
        id: fac.id,
        name: fac.name,
        designation: fac.designation,
        department: fac.department,
        subjects: (fac.subjects || []).map((sid: string) => {
          const s = subjects.find(sub => sub.id === sid);
          return s ? { id: s.id, code: s.code, name: s.name, semester: s.semester } : null;
        }).filter(Boolean),
        semesters: fac.semesters,
        totalResponses: perf?.totalResponses || 0,
        overallAverage: perf?.overallAverage || 0,
        category: perf?.category || 'Insufficient Responses',
        categoryColor: perf?.categoryColor || '#64748b'
      };
    });

    enriched.sort((a, b) => b.overallAverage - a.overallAverage);
    return { data: enriched };
  },

  async getFacultyDetail(id: string) {
    const perf = calculateFacultyPerformance(id);
    if (!perf) throw new Error('Faculty not found');
    return {
      data: {
        ...perf,
        commentSentiments: perf._commentSentiments
      }
    };
  },

  async getAnalytics() {
    const dash = await this.getDashboard();
    const subjects = getStorage<any[]>(STORAGE_KEYS.SUBJECTS, rawSubjects);
    const feedbacks = getStorage<any[]>(STORAGE_KEYS.FEEDBACK, rawFeedback);

    const subMap: Record<string, any> = {};
    for (const fb of feedbacks) {
      if (!subMap[fb.subjectId]) {
        const s = subjects.find(sub => sub.id === fb.subjectId);
        subMap[fb.subjectId] = {
          subjectName: s ? s.name : 'Unknown',
          subjectCode: s ? s.code : '',
          totalRating: 0,
          count: 0
        };
      }
      const vals = Object.values(fb.ratings || {}) as number[];
      if (vals.length) {
        subMap[fb.subjectId].totalRating += vals.reduce((a, b) => a + b, 0) / vals.length;
        subMap[fb.subjectId].count++;
      }
    }

    const subjectAverages = Object.values(subMap).map(s => ({
      name: s.subjectName,
      code: s.subjectCode,
      average: s.count > 0 ? parseFloat((s.totalRating / s.count).toFixed(2)) : 0
    }));

    return {
      data: {
        ...dash.data,
        subjectAverages
      }
    };
  },

  async getFeedback(params?: Record<string, string>) {
    const feedbacks = getStorage<any[]>(STORAGE_KEYS.FEEDBACK, rawFeedback);
    const faculty = getStorage<any[]>(STORAGE_KEYS.FACULTY, rawFaculty);
    const subjects = getStorage<any[]>(STORAGE_KEYS.SUBJECTS, rawSubjects);

    let filtered = [...feedbacks];
    if (params?.facultyId) filtered = filtered.filter(f => f.facultyId === params.facultyId);
    if (params?.subjectId) filtered = filtered.filter(f => f.subjectId === params.subjectId);

    const enriched = filtered.map(fb => {
      const fac = faculty.find(f => f.id === fb.facultyId);
      const sub = subjects.find(s => s.id === fb.subjectId);
      const allRatings = Object.values(fb.ratings || {}) as number[];
      const avgRating = allRatings.length ? parseFloat((allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(2)) : 0;
      return {
        feedbackId: fb.feedbackId,
        facultyName: fac?.name || 'Unknown',
        facultyId: fb.facultyId,
        subjectName: sub?.name || 'Unknown',
        subjectCode: sub?.code || '',
        semester: fb.semester,
        branch: fb.branch,
        ratings: fb.ratings,
        averageRating: avgRating,
        positiveComment: fb.positiveComment,
        improvementComment: fb.improvementComment,
        submittedAt: fb.submittedAt,
        sentiment: avgRating >= 4 ? 'Positive' : avgRating >= 3 ? 'Neutral' : 'Needs Attention'
      };
    });

    return { data: enriched.slice(0, 50), total: enriched.length };
  },

  async getReportData(facultyId?: string) {
    if (facultyId) {
      const detail = await this.getFacultyDetail(facultyId);
      return { data: detail.data };
    }
    const dash = await this.getDashboard();
    return { data: dash.data };
  },

  async getSettings() {
    const settings = getStorage<any>(STORAGE_KEYS.SETTINGS, rawSettings);
    return { data: settings };
  },

  async updateSettings(settings: any) {
    setStorage(STORAGE_KEYS.SETTINGS, settings);
    return { success: true, data: settings };
  },

  async getCatalog() {
    const programs = getStorage<any[]>(STORAGE_KEYS.PROGRAMS, rawPrograms);
    const subjects = getStorage<any[]>(STORAGE_KEYS.SUBJECTS, rawSubjects);
    const faculty = getStorage<any[]>(STORAGE_KEYS.FACULTY, rawFaculty);
    return { success: true, data: { programs, subjects, faculty } };
  },

  async createFaculty(facultyData: any) {
    const faculty = getStorage<any[]>(STORAGE_KEYS.FACULTY, rawFaculty);
    const newFac = {
      id: 'FAC' + String(faculty.length + 1).padStart(3, '0'),
      name: facultyData.name,
      designation: facultyData.designation,
      department: facultyData.department,
      email: facultyData.email,
      phone: facultyData.phone,
      semesters: facultyData.semesters || [1, 2],
      subjects: []
    };
    faculty.push(newFac);
    setStorage(STORAGE_KEYS.FACULTY, faculty);
    return {
      success: true,
      message: 'Faculty created successfully',
      data: newFac,
      credentials: {
        username: 'faculty' + (faculty.length),
        defaultPassword: 'faculty123'
      }
    };
  },

  async deleteFaculty(id: string) {
    let faculty = getStorage<any[]>(STORAGE_KEYS.FACULTY, rawFaculty);
    faculty = faculty.filter(f => f.id !== id);
    setStorage(STORAGE_KEYS.FACULTY, faculty);
    return { success: true, message: 'Faculty deleted successfully' };
  },

  async createProgram(programData: any) {
    const programs = getStorage<any[]>(STORAGE_KEYS.PROGRAMS, rawPrograms);
    const newProg = {
      id: 'prog_' + Math.random().toString(36).substring(2, 7),
      ...programData
    };
    programs.push(newProg);
    setStorage(STORAGE_KEYS.PROGRAMS, programs);
    return { success: true, message: 'Program created successfully', data: newProg };
  },

  async deleteProgram(id: string) {
    let programs = getStorage<any[]>(STORAGE_KEYS.PROGRAMS, rawPrograms);
    programs = programs.filter(p => p.id !== id);
    setStorage(STORAGE_KEYS.PROGRAMS, programs);
    return { success: true, message: 'Program deleted successfully' };
  },

  async createSubject(subjectData: any) {
    const subjects = getStorage<any[]>(STORAGE_KEYS.SUBJECTS, rawSubjects);
    const newSub = {
      id: 'SUB' + String(subjects.length + 1).padStart(3, '0'),
      ...subjectData
    };
    subjects.push(newSub);
    setStorage(STORAGE_KEYS.SUBJECTS, subjects);
    return { success: true, message: 'Subject created successfully', data: newSub };
  },

  async deleteSubject(id: string) {
    let subjects = getStorage<any[]>(STORAGE_KEYS.SUBJECTS, rawSubjects);
    subjects = subjects.filter(s => s.id !== id);
    setStorage(STORAGE_KEYS.SUBJECTS, subjects);
    return { success: true, message: 'Subject deleted successfully' };
  }
};
