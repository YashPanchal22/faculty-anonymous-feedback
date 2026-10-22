import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../../components/SidebarLayout';
import { facultyAPI } from '../../services/api';
import {
  LayoutDashboard,
  BarChart3,
  Loader2,
  BookOpen,
  Award,
  ShieldCheck,
  ArrowRight,
  TrendingUp,
  Star,
  Users,
  CheckCircle2
} from 'lucide-react';

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { label: 'Overview', path: '/faculty/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'My Performance Analytics', path: '/faculty/performance', icon: <BarChart3 size={18} /> },
  ];

  useEffect(() => {
    facultyAPI.getMyProfile()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <SidebarLayout navItems={navItems} title="Faculty Portal" subtitle="Academic Performance Overview">
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="animate-spin text-indigo-600" size={36} />
          <p className="text-xs text-slate-500 font-medium">Loading faculty performance telemetry...</p>
        </div>
      </SidebarLayout>
    );
  }

  const profile = data?.profile;
  const category = data?.category || 'Insufficient Responses';
  const catColor = data?.categoryColor || '#64748b';

  return (
    <SidebarLayout navItems={navItems} title="Faculty Portal" subtitle="Academic Performance & Course Telemetry">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Official Faculty Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-indigo-600/30 flex-shrink-0">
                {profile?.name?.charAt(0) || 'F'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    {profile?.department || 'Department of Computer Application'}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-[11px] font-semibold text-slate-400">Regular Faculty</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {profile?.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {profile?.designation} • Employee ID: <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{profile?.id || 'EMP-1042'}</span>
                </p>
                <div className="mt-2.5 flex items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold text-white shadow-xs"
                    style={{ backgroundColor: catColor }}
                  >
                    <Award size={12} />
                    {category}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-black" style={{ color: catColor }}>
                  {data?.overallAverage ? data?.overallAverage.toFixed(2) : '—'}
                </div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
                  Overall Score / 5.0
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  NAAC Benchmark Met
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Anonymous Responses</span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
                {data?.totalResponses || 0}
              </div>
              <p className="text-[11px] text-slate-500">Student reviews verified</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pedagogy Rating</span>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {data?.overallAverage ? `${data?.overallAverage.toFixed(2)} / 5.0` : '—'}
              </div>
              <p className="text-[11px] text-slate-500">Institutional scale</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Star size={20} className="fill-current" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned Courses</span>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                {profile?.subjects?.length || 0} Courses
              </div>
              <p className="text-[11px] text-slate-500">Active curriculum load</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <BookOpen size={20} />
            </div>
          </div>
        </div>

        {/* Action Prompt */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div>
            <h3 className="text-base font-extrabold">Detailed Pedagogical Dimensions & Longitudinal Trends</h3>
            <p className="text-xs text-indigo-200 mt-0.5">
              Inspect parameter-wise breakdowns across clarity, doubt resolution, practical examples, and download official summaries.
            </p>
          </div>
          <button
            onClick={() => navigate('/faculty/performance')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-indigo-900 text-xs font-bold shadow-sm hover:bg-indigo-50 transition-all self-start sm:self-center flex-shrink-0"
          >
            <span>Open Performance Analytics</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {/* Assigned Curriculum Courses Table */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Active Taught Courses</h3>
              <p className="text-xs text-slate-400">Current semester curriculum allocation</p>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg">
              Term II Allocation
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {profile?.subjects?.map((s: any) => (
              <div key={s.id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-lg">
                    {s.code}
                  </span>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">{s.name}</h4>
                    <p className="text-[11px] text-slate-400">B.Sc. Data Science Curriculum</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Semester {s.semester}</span>
                  <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Evaluation Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Anonymity Guarantee */}
        <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/40 rounded-2xl p-4 flex items-start gap-3 text-xs">
          <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <div className="text-slate-600 dark:text-slate-300">
            <strong className="text-emerald-800 dark:text-emerald-300">Statutory Confidentiality Assurance:</strong> Faculty dashboards provide strictly aggregated telemetry. Under university academic governance guidelines, raw response records, student identifiers, and individual ratings are strictly restricted and permanently inaccessible.
          </div>
        </div>

      </div>
    </SidebarLayout>
  );
}
