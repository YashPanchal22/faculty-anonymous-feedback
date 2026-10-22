import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, BarChart3, MessageSquarePlus } from 'lucide-react';

export default function Success() {
  const location = useLocation();
  const navigate = useNavigate();
  const feedbackId = location.state?.feedbackId || 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/30 dark:from-gray-950 dark:via-emerald-950/20 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="glass rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-green-500 text-white flex items-center justify-center mb-5 shadow-xl shadow-green-500/30">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Feedback Submitted!</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
          Your anonymous feedback has been successfully recorded. Your identity has <strong>not</strong> been stored.
        </p>

        <div className="bg-gray-50 dark:bg-gray-800/50 border border-dashed border-indigo-300 dark:border-indigo-700 rounded-xl p-4 mb-6 text-left">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase font-semibold">Anonymous Receipt Token</p>
          <code className="text-sm font-bold text-indigo-600 dark:text-indigo-400 break-all">{feedbackId}</code>
          <p className="text-xs text-gray-400 mt-2">This token is for your reference only. It cannot be traced back to your identity.</p>
        </div>

        <div className="flex gap-3">
          <button onClick={() => navigate('/student/feedback')}
            className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 text-sm">
            <MessageSquarePlus size={16} /> Submit Another
          </button>
          <button onClick={() => navigate('/student/dashboard')}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all flex items-center justify-center gap-2 text-sm border border-gray-200 dark:border-gray-700">
            <BarChart3 size={16} /> Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
