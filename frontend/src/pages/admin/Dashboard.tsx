import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../../components/SidebarLayout';
import { adminAPI } from '../../services/api';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  Settings as SettingsIcon,
  Award,
  AlertTriangle,
  TrendingUp,
  Building,
  BookOpen,
  MessageSquare,
  ArrowRight,
  Shield,
  Loader2,
  Star,
  Download
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';

export default function AdminDashboard() {
  const navigate = useNavigate();
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
    adminAPI.getDashboard()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SidebarLayout navItems={navItems} title="Executive Portal" subtitle="Institutional Feedback Analytics">
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="animate-spin text-indigo-600" size={36} />
          <p className="text-sm text-gray-500 font-medium">Aggregating institutional performance data...</p>
        </div>
      </SidebarLayout>
    );
  }

  const kpis = data?.kpis || {
    totalFeedback: 0,
    totalFaculty: 0,
    totalSubjects: 0,
    totalDepartments: 0,
    systemAverage: 0,
    topRatedCount: 0,
    needsImprovementCount: 0,
  };

  const facultyRankings = data?.facultyRankings || [];
  const departmentAverages = data?.departmentAverages || [];
  const parameterAverages = Array.isArray(data?.parameterAverages)
    ? data.parameterAverages
    : (data?.parameterAverages ? Object.values(data.parameterAverages) : []);
  const ratingDistribution = data?.ratingDistribution || {};

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
    <SidebarLayout navItems={navItems} title="Executive Portal" subtitle="Institutional Feedback Analytics">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Welcome & Authority Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                <Shield size={12} /> High Authority Clearance
              </span>
              <span className="text-xs text-gray-400">Institutional Governance Console</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">System Overview & KPI Metrics</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Real-time anonymous evaluation telemetry across university programs and departments
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/reports')}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-750 transition-all shadow-sm"
            >
              <FileText size={14} />
              Feedback Logs
            </button>
            <button
              onClick={() => {
                window.location.href = adminAPI.getCSVUrl();
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xs font-bold hover:from-indigo-500 hover:to-indigo-600 transition-all shadow-lg shadow-indigo-500/25 active:scale-95"
            >
              <Download size={14} />
              Export System CSV
            </button>
          </div>
        </div>

        {/* 7 KPI CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          
          <div className="glass rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-1">
              <span className="text-xs font-bold">Responses</span>
              <MessageSquare size={16} />
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">{kpis.totalFeedback}</div>
            <div className="text-[11px] text-gray-500 mt-1">Total Anonymous</div>
          </div>

          <div className="glass rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between text-cyan-600 dark:text-cyan-400 mb-1">
              <span className="text-xs font-bold">Faculty</span>
              <Users size={16} />
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">{kpis.totalFaculty}</div>
            <div className="text-[11px] text-gray-500 mt-1">Active Evaluated</div>
          </div>

          <div className="glass rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 mb-1">
              <span className="text-xs font-bold">Subjects</span>
              <BookOpen size={16} />
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">{kpis.totalSubjects}</div>
            <div className="text-[11px] text-gray-500 mt-1">Courses Mapped</div>
          </div>

          <div className="glass rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-1">
              <span className="text-xs font-bold">Departments</span>
              <Building size={16} />
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">{kpis.totalDepartments}</div>
            <div className="text-[11px] text-gray-500 mt-1">Academic Units</div>
          </div>

          <div className="glass rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between text-amber-500 mb-1">
              <span className="text-xs font-bold">Avg Rating</span>
              <Star size={16} className="fill-current" />
            </div>
            <div className="text-2xl font-black text-gray-900 dark:text-white">{kpis.systemAverage.toFixed(2)}</div>
            <div className="text-[11px] text-gray-500 mt-1">Institutional / 5.0</div>
          </div>

          <div className="glass rounded-2xl p-4 border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-950/10 shadow-sm">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-1">
              <span className="text-xs font-bold">Top Rated</span>
              <Award size={16} />
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{kpis.topRatedCount}</div>
            <div className="text-[11px] text-gray-500 mt-1">&gt;= 4.5 Stars</div>
          </div>

          <div className="glass rounded-2xl p-4 border border-rose-100 dark:border-rose-900/30 bg-rose-50/20 dark:bg-rose-950/10 shadow-sm col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-1">
              <span className="text-xs font-bold">Attention</span>
              <AlertTriangle size={16} />
            </div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{kpis.needsImprovementCount}</div>
            <div className="text-[11px] text-gray-500 mt-1">&lt; 3.5 Rating</div>
          </div>

        </div>

        {/* MAIN VISUALS GRID: Faculty Leaderboard & Department Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Faculty Leaderboard (2 cols) */}
          <div className="lg:col-span-2 glass rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Faculty Performance Rankings</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ranked by cumulative anonymous evaluation (Threshold: min {data?.minimumThreshold || 5} reviews)
                </p>
              </div>
              <button
                onClick={() => navigate('/admin/faculty')}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                View All <ArrowRight size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3 pl-2">Rank / Faculty</th>
                    <th className="pb-3">Department</th>
                    <th className="pb-3 text-center">Responses</th>
                    <th className="pb-3 text-right">Rating</th>
                    <th className="pb-3 text-right pr-2">Classification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                  {facultyRankings.slice(0, 6).map((fac: any, idx: number) => (
                    <tr
                      key={fac.id}
                      onClick={() => navigate('/admin/faculty')}
                      className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 pl-2 flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                          idx === 0 ? 'bg-amber-400 text-white' : idx === 1 ? 'bg-slate-300 text-slate-800' : idx === 2 ? 'bg-amber-700/80 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <span className="font-bold text-gray-900 dark:text-white block">{fac.name}</span>
                          <span className="text-[11px] text-gray-400">{fac.designation}</span>
                        </div>
                      </td>
                      <td className="py-3 text-gray-600 dark:text-gray-300 font-medium">
                        {fac.department}
                      </td>
                      <td className="py-3 text-center font-bold text-gray-700 dark:text-gray-300">
                        {fac.totalResponses}
                      </td>
                      <td className="py-3 text-right font-black text-sm" style={{ color: fac.categoryColor }}>
                        {fac.overallAverage ? fac.overallAverage.toFixed(2) : '—'}
                      </td>
                      <td className="py-3 text-right pr-2">
                        <span
                          className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white shadow-xs"
                          style={{ backgroundColor: fac.categoryColor }}
                        >
                          {fac.category}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Department Averages Bar Chart (1 col) */}
          <div className="glass rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Department Performance</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Average score by academic department</p>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentAverages} layout="vertical" margin={{ left: -10, right: 20, top: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.15} />
                    <XAxis type="number" domain={[0, 5]} tick={{ fontSize: 10 }} />
                    <YAxis dataKey="department" type="category" width={80} tick={{ fontSize: 10 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderRadius: '0.5rem',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="average" fill="#6366f1" radius={[0, 6, 6, 0]} name="Avg Rating" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs text-gray-400">
              <span>Benchmark target: 4.00</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Institutional Grade</span>
            </div>
          </div>

        </div>

        {/* BOTTOM SECTION: Parameter-wise Institution Average & Rating Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Parameter-wise Institutional Averages */}
          <div className="glass rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Parameter-wise Institutional Health</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Aggregated university-wide score across all feedback forms</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg">
                8 Core Dimensions
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {parameterAverages.map((param: any) => {
                const scoreColor = param.average >= 4.5 ? 'text-emerald-600 dark:text-emerald-400' : param.average >= 4.0 ? 'text-indigo-600 dark:text-indigo-400' : param.average >= 3.5 ? 'text-amber-500' : 'text-rose-500';
                return (
                  <div key={param.key} className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">{param.label}</div>
                      <div className="text-[11px] text-gray-400">System Avg</div>
                    </div>
                    <div className={`text-lg font-black ${scoreColor}`}>
                      {param.average.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rating Distribution (1 to 5 stars) */}
          <div className="glass rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Rating Distribution</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Breakdown of student satisfaction ratings submitted</p>
              
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={distChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        borderRadius: '0.5rem',
                        border: 'none',
                        color: '#fff',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="count" fill="#818cf8" radius={[6, 6, 0, 0]} name="Submissions">
                      {distChartData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs text-gray-400">
              <span>Higher concentrations at 4 & 5 stars indicate positive pedagogical climate</span>
              <button
                onClick={() => navigate('/admin/analytics')}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                More Analytics &rarr;
              </button>
            </div>
          </div>

        </div>

      </div>
    </SidebarLayout>
  );
}
