import { useState, useEffect } from 'react';
import SidebarLayout from '../../components/SidebarLayout';
import { adminAPI } from '../../services/api';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  Settings as SettingsIcon,
  TrendingUp,
  Award,
  BookOpen,
  Building,
  Star,
  Activity,
  Calendar,
  Loader2,
  PieChart as PieIcon
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Academic Catalog', path: '/admin/catalog', icon: <BookOpen size={18} /> },
    { label: 'Faculty Directory', path: '/admin/faculty', icon: <Users size={18} /> },
    { label: 'Deep Analytics', path: '/admin/analytics', icon: <BarChart3 size={18} /> },
    { label: 'Reports & Logs', path: '/admin/reports', icon: <FileText size={18} /> },
    { label: 'System Settings', path: '/admin/settings', icon: <SettingsIcon size={18} /> },
  ];

  useEffect(() => {
    adminAPI.getAnalytics()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SidebarLayout navItems={navItems} title="Executive Portal" subtitle="Deep Performance Analytics">
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="animate-spin text-indigo-600" size={36} />
          <p className="text-sm text-gray-500 font-medium">Computing institutional analytical vectors...</p>
        </div>
      </SidebarLayout>
    );
  }

  const facultyRankings = (data?.facultyRankings || []).slice(0, 10);
  const departmentAverages = data?.departmentAverages || [];
  const subjectAverages = (data?.subjectAverages || []).slice(0, 10);
  const parameterAverages = Array.isArray(data?.parameterAverages)
    ? data.parameterAverages
    : (data?.parameterAverages ? Object.values(data.parameterAverages) : []);
  const semesterAverages = data?.semesterAverages || [];
  const ratingDistribution = data?.ratingDistribution || {};
  const monthlyTrend = data?.monthlyTrend || [];

  const distChartData = Array.isArray(ratingDistribution)
    ? ratingDistribution.map((item: any, idx: number) => ({
        name: item.name || item.rating || `${idx + 1} Star`,
        count: typeof item.count === 'number' ? item.count : 0,
      }))
    : Object.entries(ratingDistribution).map(([star, count]) => ({
        name: `${star} Star`,
        count: count as number,
      }));

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#10b981'];

  return (
    <SidebarLayout navItems={navItems} title="Executive Portal" subtitle="Advanced Analytics & Telemetry">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Institutional Analytics Suite</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              8 dimensional telemetry suite visualizing faculty ratings, departments, subjects, semesters, and longitudinal trends
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
            <Activity size={14} /> Full Local Dataset Telemetry
          </div>
        </div>

        {/* ROW 1: Chart 1 (Faculty Ratings) & Chart 2 (Department Ratings) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 1. Faculty Average Rating Chart */}
          <div className="glass rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Award size={16} className="text-indigo-600" />
                  1. Faculty Average Rating
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Top faculty evaluated by students</p>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                Scale 1-5
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={facultyRankings} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.15} />
                  <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '0.5rem', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="overallAverage" fill="#6366f1" radius={[0, 6, 6, 0]} name="Rating" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Department Average Rating Chart */}
          <div className="glass rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Building size={16} className="text-cyan-600" />
                  2. Department Average Rating
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Institutional aggregate per academic division</p>
              </div>
              <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-900/30 px-2 py-0.5 rounded">
                Cross-Dept
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentAverages} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="department" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '0.5rem', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="average" fill="#06b6d4" radius={[6, 6, 0, 0]} name="Dept Avg" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* ROW 2: Chart 3 (Subject Average) & Chart 4 (Parameter-wise Average) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 3. Subject Average Rating Chart */}
          <div className="glass rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <BookOpen size={16} className="text-purple-600" />
                  3. Subject Average Rating
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Curriculum course satisfaction rankings</p>
              </div>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded">
                Courses
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectAverages} layout="vertical" margin={{ left: 10, right: 20, top: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.15} />
                  <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 10 }} />
                  <YAxis dataKey="code" type="category" width={60} tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '0.5rem', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="average" fill="#a855f7" radius={[0, 6, 6, 0]} name="Course Avg" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. Parameter-wise Average Chart */}
          <div className="glass rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Star size={16} className="text-amber-500" />
                  4. Parameter-wise Average Performance
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">8 pedagogy dimensions evaluated</p>
              </div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded">
                8 Pillars
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={parameterAverages} margin={{ left: -15, right: 10, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={0} angle={-25} textAnchor="end" height={45} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '0.5rem', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="average" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Score" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* ROW 3: Chart 5 (Semester-wise) & Chart 6 (Feedback Count by Semester) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 5. Semester-wise Rating */}
          <div className="glass rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar size={16} className="text-emerald-600" />
                  5. Semester-wise Satisfaction Rating
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Average rating grouped by academic term</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded">
                Sem 1-8
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={semesterAverages} margin={{ left: -15, right: 10, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="semester" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '0.5rem', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="average" fill="#10b981" radius={[6, 6, 0, 0]} name="Term Avg" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 6. Feedback Count per Semester */}
          <div className="glass rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity size={16} className="text-blue-600" />
                  6. Feedback Response Volume
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Student participation density by semester</p>
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                Volume
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={semesterAverages} margin={{ left: -15, right: 10, top: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="semester" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '0.5rem', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Responses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* ROW 4: Chart 7 (Rating Distribution) & Chart 8 (Monthly Trend) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 7. Rating Distribution */}
          <div className="glass rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <PieIcon size={16} className="text-pink-600" />
                  7. Rating Star Distribution
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Percentage distribution across 1 to 5 star ratings</p>
              </div>
              <span className="text-xs font-bold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/30 px-2 py-0.5 rounded">
                Share %
              </span>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="count"
                    label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {distChartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '0.5rem', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 8. Monthly / Trend Analysis */}
          <div className="glass rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingUp size={16} className="text-indigo-600" />
                  8. Longitudinal Satisfaction Trend
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Time-series tracking of mean monthly ratings</p>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded">
                Temporal
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '0.5rem', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#4f46e5' }}
                    name="Mean Rating"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>
    </SidebarLayout>
  );
}
