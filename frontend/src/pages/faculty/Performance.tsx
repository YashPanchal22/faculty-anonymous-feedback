import { useState, useEffect } from 'react';
import SidebarLayout from '../../components/SidebarLayout';
import { facultyAPI } from '../../services/api';
import {
  BarChart3,
  LayoutDashboard,
  TrendingUp,
  Award,
  AlertTriangle,
  BookOpen,
  Sparkles,
  Download,
  Loader2,
  ShieldAlert,
  Star
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
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function FacultyPerformance() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { label: 'Dashboard', path: '/faculty/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'My Performance', path: '/faculty/performance', icon: <BarChart3 size={18} /> },
  ];

  useEffect(() => {
    facultyAPI.getMyPerformance()
      .then(res => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadSummary = () => {
    if (!data) return;
    const doc = new jsPDF();
    
    // Header banner
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 35, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('FACULTY PERFORMANCE SUMMARY', 14, 18);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Faculty: ${data.profile?.name} | Department: ${data.profile?.department}`, 14, 26);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 31);

    // Summary Card
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Performance Overview', 14, 45);
    
    autoTable(doc, {
      startY: 48,
      head: [['Metric', 'Value']],
      body: [
        ['Overall Rating', `${data.overallAverage?.toFixed(2) || 'N/A'} / 5.00`],
        ['Total Anonymous Responses', `${data.totalResponses}`],
        ['Performance Classification', `${data.category}`],
        ['Designation', `${data.profile?.designation}`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
    });

    // Parameter performance table
    const currentY = (doc as any).lastAutoTable.finalY + 10;
    doc.text('Parameter-wise Performance Breakdown', 14, currentY);

    const paramRows = (data.parameterAverages || []).map((p: any) => [
      p.label,
      `${p.average.toFixed(2)} / 5.00`,
      p.average >= 4.5 ? 'Excellent' : p.average >= 4.0 ? 'Strong' : p.average >= 3.0 ? 'Average' : 'Needs Attention'
    ]);

    autoTable(doc, {
      startY: currentY + 4,
      head: [['Evaluation Parameter', 'Score', 'Status']],
      body: paramRows,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
    });

    // Subject breakdown table
    const subjectY = (doc as any).lastAutoTable.finalY + 10;
    doc.text('Subject-wise Performance', 14, subjectY);
    const subRows = (data.subjectStats || []).map((s: any) => [
      s.subjectCode,
      s.subjectName,
      `${s.count} responses`,
      `${s.averageRating?.toFixed(2) || 'N/A'} / 5.00`
    ]);

    autoTable(doc, {
      startY: subjectY + 4,
      head: [['Code', 'Subject Name', 'Responses', 'Average Rating']],
      body: subRows,
      theme: 'striped',
      headStyles: { fillColor: [129, 140, 248] },
    });

    // Privacy notice at bottom
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text('Privacy Guarantee: This report contains strictly aggregated feedback data.', 14, finalY);
    doc.text('No student identities, names, or raw individual responses are ever recorded or accessible.', 14, finalY + 5);

    doc.save(`Faculty_Summary_${data.profile?.id || 'export'}.pdf`);
  };

  if (loading) {
    return (
      <SidebarLayout navItems={navItems} title="Faculty Portal" subtitle="My Performance Analytics">
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="animate-spin text-indigo-600" size={36} />
          <p className="text-sm text-gray-500 font-medium">Computing your aggregate performance metrics...</p>
        </div>
      </SidebarLayout>
    );
  }

  const profile = data?.profile;
  const category = data?.category || 'Insufficient Responses';
  const catColor = data?.categoryColor || '#64748b';
  const parameterAverages = data?.parameterAverages || [];
  const subjectStats = data?.subjectStats || [];
  const trendData = data?.trendData || [];
  const commonStrengths = data?.commonStrengths || [];
  const commonImprovements = data?.commonImprovements || [];

  return (
    <SidebarLayout navItems={navItems} title="Faculty Portal" subtitle="Detailed Performance Analytics">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header with Title and Download Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Performance Analytics</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Aggregated feedback metrics for <strong className="text-gray-700 dark:text-gray-300">{profile?.name}</strong>
            </p>
          </div>
          <button
            onClick={handleDownloadSummary}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-indigo-600 transition-all active:scale-95"
          >
            <Download size={16} />
            Download Performance Summary (PDF)
          </button>
        </div>

        {/* Top Summary Banner */}
        <div className="glass rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            <div className="md:col-span-2 flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-indigo-500/30">
                {profile?.name?.charAt(0) || 'F'}
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  {profile?.department}
                </span>
                <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">{profile?.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{profile?.designation}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span
                    className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-bold text-white shadow-sm"
                    style={{ backgroundColor: catColor }}
                  >
                    <Award size={12} />
                    {category}
                  </span>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-4 text-center border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-center gap-1 text-3xl font-black" style={{ color: catColor }}>
                {data?.overallAverage?.toFixed(2) || '—'}
                <Star size={22} className="fill-current" />
              </div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">Overall Average Rating</p>
              <p className="text-[11px] text-gray-400">Scale of 1.0 - 5.0</p>
            </div>

            <div className="glass rounded-xl p-4 text-center border border-gray-100 dark:border-gray-800">
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {data?.totalResponses || 0}
              </div>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1">Total Anonymous Reviews</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">100% Identity Protected</p>
            </div>
          </div>
        </div>

        {/* Parameter-wise Performance & Trends Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Parameter-wise Performance */}
          <div className="glass rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">Parameter-wise Scores</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Aggregated breakdown across 8 key pedagogy aspects</p>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-1 rounded-lg">
                8 Parameters
              </span>
            </div>

            <div className="space-y-3.5">
              {parameterAverages.map((param: any) => {
                const pct = (param.average / 5) * 100;
                const scoreColor = param.average >= 4.5 ? 'bg-emerald-500' : param.average >= 4.0 ? 'bg-indigo-500' : param.average >= 3.0 ? 'bg-amber-500' : 'bg-red-500';
                return (
                  <div key={param.key} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{param.label}</span>
                      <div className="flex items-center gap-1 font-bold text-gray-900 dark:text-white">
                        <span>{param.average.toFixed(2)}</span>
                        <span className="text-gray-400 font-normal">/ 5.0</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-700 ${scoreColor}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Trend Chart */}
          <div className="glass rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">Performance Trend</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Monthly progression of student ratings</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded-lg">
                  <TrendingUp size={14} /> Monthly Trend
                </div>
              </div>

              {trendData.length > 0 ? (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                      <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(17, 24, 39, 0.9)',
                          borderColor: '#374151',
                          borderRadius: '0.75rem',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="averageRating"
                        stroke="#6366f1"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 7 }}
                        name="Average Rating"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-xs text-gray-400">
                  No historical trend data available yet.
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
              <span>Ratings recorded over time</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">Consistent tracking</span>
            </div>
          </div>
        </div>

        {/* Subject-Wise Performance Breakdown */}
        <div className="glass rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base">Subject-wise Evaluation</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Performance ratings filtered by taught curriculum courses</p>
            </div>
            <BookOpen size={20} className="text-gray-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectStats.map((sub: any) => (
              <div
                key={sub.subjectId}
                className="p-4 rounded-xl border border-gray-200/70 dark:border-gray-700/70 bg-gray-50/50 dark:bg-gray-800/30 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                    {sub.subjectCode}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {sub.count} {sub.count === 1 ? 'response' : 'responses'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 mb-2">
                  {sub.subjectName}
                </h4>
                <div className="flex items-center justify-between pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
                  <span className="text-xs text-gray-500">Course Average</span>
                  <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                    {sub.averageRating ? sub.averageRating.toFixed(2) : '—'} / 5.0
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Aggregated Themes: Strengths & Improvement Areas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div className="glass rounded-2xl p-6 border-l-4 border-emerald-500 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
              <Sparkles size={18} />
              <h4>Recognized Pedagogical Strengths</h4>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Synthesized from recurring positive feedback patterns:
            </p>
            <ul className="space-y-2 mt-2">
              {commonStrengths.length > 0 ? (
                commonStrengths.map((str: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <span className="text-emerald-500 font-black">✓</span>
                    <span>{str}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-gray-400 italic">No recurring strengths flagged yet.</li>
              )}
            </ul>
          </div>

          {/* Improvement Opportunities */}
          <div className="glass rounded-2xl p-6 border-l-4 border-amber-500 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold">
              <AlertTriangle size={18} />
              <h4>Opportunities for Growth</h4>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Constructive focus areas highlighted across student evaluations:
            </p>
            <ul className="space-y-2 mt-2">
              {commonImprovements.length > 0 ? (
                commonImprovements.map((imp: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-gray-700 dark:text-gray-300">
                    <span className="text-amber-500 font-black">•</span>
                    <span>{imp}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-gray-400 italic">No specific improvement areas flagged.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Security & Privacy Banner */}
        <div className="rounded-2xl p-4 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-indigo-500/10 border border-emerald-500/30 flex items-start gap-3">
          <ShieldAlert size={20} className="text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-gray-600 dark:text-gray-300">
            <strong className="text-emerald-700 dark:text-emerald-400">Strict Anonymity Safeguard:</strong> This faculty portal displays aggregate statistics and summarized pedagogical themes only. In accordance with university privacy policy, individual student names, student IDs, emails, raw comments, or exact submission timestamps are permanently shielded from faculty view.
          </div>
        </div>

      </div>
    </SidebarLayout>
  );
}
