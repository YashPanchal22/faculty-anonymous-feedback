// TypeScript type definitions for Faculty Anonymous Feedback System

export type UserRole = 'student' | 'faculty' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  facultyId?: string;
  program?: string;
  semester?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface Program {
  id: string;
  name: string;
  code: string;
  department: string;
  totalSemesters: number;
}

export interface Semester {
  id: number;
  name: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  semester: number;
  program: string;
  department: string;
}

export interface FacultyBasic {
  id: string;
  name: string;
  designation: string;
  department: string;
}

export interface FacultyFull extends FacultyBasic {
  subjects: { id: string; code: string; name: string; semester: number }[];
  semesters: number[];
  totalResponses: number;
  overallAverage: number;
  category: string;
  categoryColor: string;
}

export interface Ratings {
  subjectKnowledge: number;
  clarity: number;
  communication: number;
  engagement: number;
  punctuality: number;
  doubtResolution: number;
  practicalExamples: number;
  overallSatisfaction: number;
}

export interface FeedbackSubmission {
  facultyId: string;
  subjectId: string;
  semester: number;
  branch: string;
  ratings: Ratings;
  positiveComment: string;
  improvementComment: string;
}

export interface ParameterAverage {
  key: string;
  label: string;
  average: number;
}

export interface SubjectStat {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  count: number;
  averageRating: number;
}

export interface TrendDataPoint {
  month: string;
  count: number;
  averageRating: number;
}

export interface FacultyPerformance {
  profile: FacultyFull;
  totalResponses: number;
  overallAverage: number;
  category: string;
  categoryColor: string;
  parameterAverages: ParameterAverage[];
  subjectStats: SubjectStat[];
  trendData: TrendDataPoint[];
  commonStrengths: string[];
  commonImprovements: string[];
}

export interface DashboardKPIs {
  totalFeedback: number;
  totalFaculty: number;
  totalSubjects: number;
  totalDepartments: number;
  systemAverage: number;
  topRatedCount: number;
  needsImprovementCount: number;
}

export interface AdminDashboardData {
  kpis: DashboardKPIs;
  facultyRankings: FacultyFull[];
  departmentAverages: { department: string; average: number }[];
  parameterAverages: ParameterAverage[];
  ratingDistribution: Record<string, number>;
  semesterAverages: { semester: string; average: number; count: number }[];
  monthlyTrend: { month: string; count: number; average: number }[];
  minimumThreshold: number;
}

export interface FeedbackRecord {
  feedbackId: string;
  facultyName: string;
  facultyId: string;
  subjectName: string;
  subjectCode: string;
  semester: number;
  branch: string;
  ratings: Ratings;
  averageRating: number;
  positiveComment: string;
  improvementComment: string;
  positiveSentiment: { label: string; score: number };
  improvementSentiment: { label: string; score: number };
  submittedAt: string;
}

export interface CommentSentiment {
  text: string;
  sentiment: { label: string; score: number };
}

export interface AdminFacultyDetail {
  faculty: {
    id: string;
    name: string;
    designation: string;
    department: string;
    subjects: { id: string; code: string; name: string; semester: number }[];
  };
  totalResponses: number;
  overallAverage: number;
  category: string;
  categoryColor: string;
  parameterAverages: ParameterAverage[];
  subjectStats: SubjectStat[];
  trendData: TrendDataPoint[];
  themes: { strengths: string[]; improvements: string[] };
  commentSentiments: CommentSentiment[];
}
