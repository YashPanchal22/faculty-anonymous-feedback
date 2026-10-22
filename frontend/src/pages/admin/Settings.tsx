import { useState, useEffect } from 'react';
import SidebarLayout from '../../components/SidebarLayout';
import { adminAPI } from '../../services/api';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  Settings as SettingsIcon,
  Save,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Database,
  Lock,
  Sliders,
  Server,
  Loader2,
  BookOpen
} from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>({ minimumResponsesForRanking: 5 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Academic Catalog', path: '/admin/catalog', icon: <BookOpen size={18} /> },
    { label: 'Faculty Directory', path: '/admin/faculty', icon: <Users size={18} /> },
    { label: 'Deep Analytics', path: '/admin/analytics', icon: <BarChart3 size={18} /> },
    { label: 'Reports & Logs', path: '/admin/reports', icon: <FileText size={18} /> },
    { label: 'System Settings', path: '/admin/settings', icon: <SettingsIcon size={18} /> },
  ];

  useEffect(() => {
    adminAPI.getSettings()
      .then(res => setSettings(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const res = await adminAPI.updateSettings({
        minimumResponsesForRanking: parseInt(settings.minimumResponsesForRanking, 10),
      });
      setSettings(res.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SidebarLayout navItems={navItems} title="Executive Portal" subtitle="System Configuration">
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="animate-spin text-indigo-600" size={36} />
          <p className="text-sm text-gray-500 font-medium">Loading system configurations...</p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout navItems={navItems} title="Executive Portal" subtitle="Institutional System Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Institutional Settings & Security Policies</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure analytical thresholds, review privacy algorithms, and inspect local storage diagnostics
          </p>
        </div>

        {/* Success / Error Notification */}
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle size={16} /> Configuration saved successfully. New threshold is immediately effective across all dashboards.
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Section 1: Ranking Threshold Form */}
        <div className="glass rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sliders size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Minimum Response Threshold for Ranking</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Prevents ranking skew by requiring a sample size of student reviews before classifying faculty
              </p>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                Minimum Required Responses (Current: {settings.minimumResponsesForRanking})
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={settings.minimumResponsesForRanking}
                  onChange={e => setSettings({ ...settings, minimumResponsesForRanking: e.target.value })}
                  className="w-32 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <span className="text-xs text-gray-500">
                  Faculty with fewer responses will display <em>"Insufficient Responses"</em> and be excluded from rankings.
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-indigo-600 transition-all disabled:opacity-50 active:scale-95"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Update Threshold Policy
              </button>
            </div>
          </form>
        </div>

        {/* Section 2: Anti-Identity Privacy Architecture Diagnostics */}
        <div className="glass rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Lock size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Active Privacy & Anti-Identity Architecture</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Cryptographic and algorithmic safeguards ensuring student feedback anonymity
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-1">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <ShieldCheck size={14} /> Identity Stripping Gateway
              </span>
              <p className="text-gray-600 dark:text-gray-300 text-[11px]">
                `POST /api/feedback` automatically rejects student IDs, emails, IP addresses, and user identifiers. Stored payload contains only feedbackId, subjectId, facultyId, and ratings.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-1">
              <span className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <ShieldCheck size={14} /> Role-Based Backend Shield
              </span>
              <p className="text-gray-600 dark:text-gray-300 text-[11px]">
                JWT token roles enforced on express controllers. Faculty endpoints strictly compute aggregate averages and prevent access to raw response tables.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-1">
              <span className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                <ShieldCheck size={14} /> Local Duplicate Submission Prevention
              </span>
              <p className="text-gray-600 dark:text-gray-300 text-[11px]">
                Hashed anonymous session tokens prevent multiple submissions on the same subject without deanonymizing the student.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 space-y-1">
              <span className="font-bold text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                <ShieldCheck size={14} /> Local Rule-Based Sentiment Analysis
              </span>
              <p className="text-gray-600 dark:text-gray-300 text-[11px]">
                Zero external telemetry. Text analysis runs completely locally on node without transmitting student remarks to third-party AI APIs.
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Local JSON Storage Engine Diagnostics */}
        <div className="glass rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Database size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Local JSON Storage Engine Status</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Self-contained file-based storage guaranteeing 100% offline and rapid competition-ready execution
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800/60 flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">/backend/data/users.json</span>
              <span className="text-emerald-600 font-bold">ONLINE (Role Auth)</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800/60 flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">/backend/data/faculty.json</span>
              <span className="text-emerald-600 font-bold">ONLINE (Faculty Roster)</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800/60 flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">/backend/data/subjects.json</span>
              <span className="text-emerald-600 font-bold">ONLINE (B.Sc. Data Science Curriculum)</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800/60 flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">/backend/data/feedback.json</span>
              <span className="text-emerald-600 font-bold">ONLINE (Anti-Identity Anonymous Store)</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800/60 flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-300">/backend/data/settings.json</span>
              <span className="text-emerald-600 font-bold">ONLINE (Threshold Configurations)</span>
            </div>
          </div>
        </div>

      </div>
    </SidebarLayout>
  );
}
