// Official Production Portal Login - Apex University
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authAPI } from '../services/api';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  KeyRound,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  GraduationCap,
  Briefcase,
  Shield,
  HelpCircle,
  Phone,
  Mail,
  ExternalLink
} from 'lucide-react';

export default function Login() {
  const [activeTab, setActiveTab] = useState<'student' | 'faculty' | 'admin'>('student');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Forgot password modal state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<'username' | 'reset' | 'success'>('username');
  const [forgotUsername, setForgotUsername] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');
  const [userInfo, setUserInfo] = useState<{ name?: string; role?: string }>({});

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter your credentials to proceed.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await authAPI.login(username.trim(), password.trim());
      login(res.token, res.user);
      const routes: Record<string, string> = {
        student: '/student/dashboard',
        faculty: '/faculty/dashboard',
        admin: '/admin/dashboard',
      };
      navigate(routes[res.user.role] || '/');
    } catch (err: any) {
      setError(err.message || 'Invalid username or password. Please verify and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Request OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotUsername.trim()) {
      setForgotError('Please enter your university username.');
      return;
    }

    setForgotLoading(true);
    setForgotError('');
    try {
      const res = await authAPI.forgotPassword(forgotUsername.trim());
      setGeneratedCode(res.verificationCode || '');
      setUserInfo({ name: res.name, role: res.role });
      setForgotStep('reset');
    } catch (err: any) {
      setForgotError(err.message || 'Unable to find an account with this username.');
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: Verify Code and Set New Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setForgotError('Please enter the 6-digit verification code.');
      return;
    }
    if (newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    setForgotLoading(true);
    setForgotError('');
    try {
      const res = await authAPI.resetPassword({
        username: forgotUsername.trim(),
        code: verificationCode.trim(),
        newPassword: newPassword.trim(),
      });
      setForgotSuccessMsg(res.message);
      setForgotStep('success');
    } catch (err: any) {
      setForgotError(err.message || 'Invalid verification code. Please check and try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep('username');
    setForgotUsername('');
    setVerificationCode('');
    setGeneratedCode('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotError('');
    setForgotSuccessMsg('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between text-slate-900 dark:text-slate-100">
      
      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl grid md:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero / Brand Column (md:col-span-5) */}
          <div className="md:col-span-5 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white text-3xl font-black shadow-xl shadow-indigo-600/30">
              🎓
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[11px] font-bold mb-2">
                <ShieldCheck size={12} /> Internal Quality Assurance Cell (IQAC)
              </div>
              <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                Apex University
              </h1>
              <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                Faculty Evaluation & Performance Analytics Portal
              </p>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Empowering pedagogical excellence through confidential student evaluation, data-driven academic governance, and accredited quality benchmarks.
            </p>

            <div className="hidden md:block pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                <ShieldCheck size={16} className="text-emerald-500 flex-shrink-0" />
                <span><strong>100% Identity Shielded:</strong> Student IDs are stripped at entry.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Portal Sign-In Card (md:col-span-7) */}
          <div className="md:col-span-7">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-7 sm:p-9 border border-slate-200 dark:border-slate-800 relative">
              
              {/* Role Context Tabs */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white">
                    Sign In to Portal
                  </h2>
                  <span className="text-[11px] text-slate-400 font-medium">Select access tier</span>
                </div>

                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('student'); setError(''); }}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'student'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <GraduationCap size={14} /> Student
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('faculty'); setError(''); }}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'faculty'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Briefcase size={14} /> Faculty
                  </button>

                  <button
                    type="button"
                    onClick={() => { setActiveTab('admin'); setError(''); }}
                    className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'admin'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <Shield size={14} /> Authority
                  </button>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    {activeTab === 'student' ? 'Student Enrollment ID' : activeTab === 'faculty' ? 'Faculty Employee ID' : 'Administrative User'}
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                      placeholder={activeTab === 'student' ? 'Enter student ID (e.g. student1)' : activeTab === 'faculty' ? 'Enter faculty ID (e.g. faculty1)' : 'Enter admin username (e.g. admin)'}
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotUsername(username);
                        setShowForgotModal(true);
                      }}
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 hover:underline transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-10 pr-11 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                      placeholder="Enter account password"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="px-4 py-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle size={15} className="flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/25 hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm active:scale-95"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Authenticating Credentials...
                    </>
                  ) : (
                    `Authenticate as ${activeTab === 'student' ? 'Student' : activeTab === 'faculty' ? 'Faculty Member' : 'Institutional Admin'}`
                  )}
                </button>
              </form>

              {/* Privacy Guarantee Note */}
              <div className="mt-5 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
                <strong>🔒 Academic Privacy Safeguard:</strong> All submitted faculty feedback is fully anonymized. No faculty member or department head can trace feedback to any individual student.
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Institutional Enterprise Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md py-4 px-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              Apex University • Internal Quality Assurance Cell (IQAC)
            </p>
            <p className="text-[11px] text-slate-400">
              Institutional Quality & Academic Evaluation Division
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <a href="mailto:support@apexuni.edu" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
              <Mail size={12} /> IT Support
            </a>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Phone size={12} /> +1 (800) 555-APEX
            </span>
            <span>•</span>
            <span className="text-emerald-600 font-bold">256-Bit SSL Secured</span>
          </div>
        </div>
      </footer>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 relative p-6 sm:p-7 space-y-5">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <KeyRound size={18} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Self-Service Password Reset
                  </h3>
                  <p className="text-[11px] text-slate-400">Institutional Identity Security</p>
                </div>
              </div>

              <button
                onClick={closeForgotModal}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {forgotError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} className="flex-shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {/* STEP 1: Enter Username */}
            {forgotStep === 'username' && (
              <form onSubmit={handleRequestOTP} className="space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter your university enrollment ID or employee username to receive a secure identity verification code.
                </p>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
                    University Username
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={forgotUsername}
                      onChange={e => setForgotUsername(e.target.value)}
                      placeholder="e.g. student1, faculty1, admin"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {forgotLoading ? <Loader2 size={16} className="animate-spin" /> : 'Generate Verification Code'}
                </button>
              </form>
            )}

            {/* STEP 2: Enter OTP & New Password */}
            {forgotStep === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span>Identity Code Dispatched</span>
                    <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-indigo-200 dark:bg-indigo-800 font-mono">
                      {userInfo.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Account: <strong className="text-indigo-700 dark:text-indigo-300">{userInfo.name}</strong> ({forgotUsername})
                  </p>
                  <div className="mt-1 p-2 rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Verification Code:</span>
                    <span className="font-mono text-base font-black tracking-widest text-indigo-600 dark:text-indigo-400">
                      {generatedCode}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm font-mono tracking-wider text-center font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full px-4 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setForgotStep('username')}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {forgotLoading ? <Loader2 size={16} className="animate-spin" /> : 'Update Password'}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: Success Confirmation */}
            {forgotStep === 'success' && (
              <div className="text-center py-4 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Password Reset Complete!
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {forgotSuccessMsg || 'Your password has been updated in the institutional database.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setUsername(forgotUsername);
                    setPassword(newPassword);
                    closeForgotModal();
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all"
                >
                  Return to Sign In & Continue
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
