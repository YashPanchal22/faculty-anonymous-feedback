import SidebarLayout from '../../components/SidebarLayout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard,
  MessageSquarePlus,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  BookOpen,
  ArrowRight,
  Clock,
  Sparkles,
  Award
} from 'lucide-react';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const navItems = [
    { label: 'Overview', path: '/student/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Submit Course Evaluation', path: '/student/feedback', icon: <MessageSquarePlus size={18} /> },
  ];

  return (
    <SidebarLayout navItems={navItems} title="Student Academic Portal" subtitle="Course & Pedagogy Evaluation">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Student Profile Header Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-500/25">
                {user?.name?.charAt(0) || 'S'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Enrolled Student
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="text-[11px] font-semibold text-slate-400">Regular Status</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  Welcome, {user?.name}!
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  B.Sc. Data Science • Semester 3 • Dept. of Computer Application
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/student/feedback')}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all active:scale-95 self-start sm:self-center"
            >
              <MessageSquarePlus size={16} />
              Evaluate Faculty Now
            </button>
          </div>
        </div>

        {/* Evaluation Window Banner */}
        <div className="rounded-2xl p-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
              <Calendar size={20} className="text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wide uppercase text-indigo-300">
                  Current Evaluation Session
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Active
                </span>
              </div>
              <p className="text-sm font-extrabold text-white mt-0.5">
                AY 2024–2025 Even Semester • Faculty Evaluation Survey
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-indigo-200 bg-white/10 px-3.5 py-2 rounded-xl self-start sm:self-center">
            <Clock size={14} />
            <span>Submission Deadline: <strong>30 Sept 2024</strong></span>
          </div>
        </div>

        {/* Identity Safeguard Banner */}
        <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-800/40 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div className="text-xs space-y-1">
            <h3 className="font-extrabold text-sm text-emerald-900 dark:text-emerald-200">
              Zero Retaliation & Absolute Anonymity Guarantee
            </h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              In accordance with university quality governance policy, your evaluation is encrypted and permanently unlinked from your student profile. Neither your course instructors nor department heads have access to student names, IDs, emails, or individual submission timestamps.
            </p>
          </div>
        </div>

        {/* Quick Action Grid */}
        <div className="grid md:grid-cols-2 gap-5">
          
          <div
            onClick={() => navigate('/student/feedback')}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/60 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MessageSquarePlus size={22} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                Start Course Evaluation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Rate assigned course faculty across 8 pedagogical dimensions including subject clarity, communication, doubt resolution, and practical demonstrations.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span>Begin Survey Form</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <Award size={22} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Evaluation Guidelines & Impact
              </h3>
              <ul className="text-xs text-slate-500 dark:text-slate-400 mt-2 space-y-1.5 list-disc list-inside leading-relaxed">
                <li>Evaluations directly shape curriculum refinement and pedagogy training.</li>
                <li>Provide objective, constructive feedback based on classroom experience.</li>
                <li>Qualitative comments are summarized into thematic strengths and growth areas.</li>
              </ul>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
              Verified by IQAC Academic Committee
            </div>
          </div>

        </div>

        {/* Rating Scale Guide */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Standard 5-Point Likert Rating Metric
          </h3>
          <div className="grid grid-cols-5 gap-2 text-center text-xs">
            {[
              { val: 1, label: 'Very Poor', color: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40' },
              { val: 2, label: 'Poor', color: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/40' },
              { val: 3, label: 'Average', color: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40' },
              { val: 4, label: 'Good', color: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/40' },
              { val: 5, label: 'Excellent', color: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40' },
            ].map(r => (
              <div key={r.val} className={`${r.color} rounded-2xl p-3 border font-semibold`}>
                <div className="text-base font-black">{'★'.repeat(r.val)}</div>
                <div className="mt-1 font-bold">{r.label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </SidebarLayout>
  );
}
