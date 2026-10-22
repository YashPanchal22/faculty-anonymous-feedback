import { useState, useEffect } from 'react';
import SidebarLayout from '../../components/SidebarLayout';
import { adminAPI } from '../../services/api';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  Settings as SettingsIcon,
  Download,
  Filter,
  Search,
  ShieldCheck,
  Star,
  MessageSquare,
  Sparkles,
  Loader2,
  Calendar,
  Layers,
  FileSpreadsheet,
  BookOpen
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AdminReports() {
  const [feedbackList, setFeedbackList] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [minRating, setMinRating] = useState('0');

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Academic Catalog', path: '/admin/catalog', icon: <BookOpen size={18} /> },
    { label: 'Faculty Directory', path: '/admin/faculty', icon: <Users size={18} /> },
    { label: 'Deep Analytics', path: '/admin/analytics', icon: <BarChart3 size={18} /> },
    { label: 'Reports & Logs', path: '/admin/reports', icon: <FileText size={18} /> },
    { label: 'System Settings', path: '/admin/settings', icon: <SettingsIcon size={18} /> },
  ];

  useEffect(() => {
    Promise.all([
      adminAPI.getFeedback(),
      adminAPI.getAllFaculty(),
    ])
      .then(([fbRes, facRes]) => {
        setFeedbackList(fbRes.data);
        setFacultyList(facRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Filter feedbacks
  const filtered = feedbackList.filter(fb => {
    const matchesSearch =
      fb.facultyName?.toLowerCase().includes(search.toLowerCase()) ||
      fb.subjectName?.toLowerCase().includes(search.toLowerCase()) ||
      fb.positiveComment?.toLowerCase().includes(search.toLowerCase()) ||
      fb.improvementComment?.toLowerCase().includes(search.toLowerCase());

    const matchesFaculty = selectedFaculty === 'All' || fb.facultyId === selectedFaculty;
    const matchesSemester = selectedSemester === 'All' || fb.semester.toString() === selectedSemester;
    const matchesMinRating = (fb.averageRating || 0) >= parseFloat(minRating);

    return matchesSearch && matchesFaculty && matchesSemester && matchesMinRating;
  });

  // Comprehensive Institutional PDF Generation
  const handleDownloadFullPDF = async () => {
    setGeneratingPDF(true);
    try {
      const res = await adminAPI.getReportData();
      const report = res.data;
      const doc = new jsPDF();

      // Cover Header
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, 210, 36, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('INSTITUTIONAL FACULTY EVALUATION REPORT', 14, 18);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('B.Sc. Data Science & Computer Applications Curriculum', 14, 25);
      doc.text(`Generated: ${new Date().toLocaleString()} | Executive Governance Copy`, 14, 31);

      // Section 1: Executive KPI Overview
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Institutional Performance KPI Summary', 14, 46);

      const kpis = report.kpis;
      autoTable(doc, {
        startY: 50,
        head: [['Metric Description', 'Quantitative Value']],
        body: [
          ['Total Anonymous Student Submissions', `${kpis.totalFeedback}`],
          ['Total Faculty Evaluated', `${kpis.totalFaculty}`],
          ['Total Academic Courses Evaluated', `${kpis.totalSubjects}`],
          ['Institutional Overall Rating Average', `${(kpis?.systemAverage != null ? kpis.systemAverage : 0).toFixed(2)} / 5.00`],
          ['Top Rated Faculty Count (>= 4.5 Stars)', `${kpis.topRatedCount}`],
          ['Faculty Requiring Development (< 3.5 Stars)', `${kpis.needsImprovementCount}`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
      });

      // Section 2: Faculty Rankings Table
      let currentY = (doc as any).lastAutoTable.finalY + 12;
      doc.text('2. Faculty Performance Classification & Rankings', 14, currentY);

      const rankingRows = (report.facultyRankings || []).map((f: any, idx: number) => [
        `#${idx + 1}`,
        f.name,
        f.department,
        `${f.totalResponses}`,
        `${f.overallAverage ? f.overallAverage.toFixed(2) : 'N/A'} / 5.00`,
        f.category,
      ]);

      autoTable(doc, {
        startY: currentY + 4,
        head: [['Rank', 'Faculty Name', 'Department', 'Responses', 'Average', 'Category']],
        body: rankingRows,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] },
      });

      // Section 3: Anonymous Feedback Remarks Sample
      doc.addPage();
      doc.text('3. Authorized Anonymous Student Evaluation Remarks (Sample)', 14, 20);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 116, 139);
      doc.text('Privacy Notice: In accordance with university privacy standards, student identities are NOT stored.', 14, 25);

      const commentRows = filtered.slice(0, 15).map(fb => [
        fb.feedbackId,
        fb.facultyName,
        fb.subjectName,
        `Sem ${fb.semester}`,
        `${fb.averageRating}★`,
        fb.positiveComment || '—',
        fb.improvementComment || '—',
      ]);

      autoTable(doc, {
        startY: 30,
        head: [['ID', 'Faculty', 'Subject', 'Sem', 'Rating', 'What Went Well', 'Areas to Improve']],
        body: commentRows,
        theme: 'striped',
        headStyles: { fillColor: [129, 140, 248] },
        styles: { fontSize: 7, cellPadding: 2 },
      });

      doc.save(`Institutional_Faculty_Report_${new Date().toISOString().slice(0,10)}.pdf`);
    } catch (err: any) {
      alert('Failed to generate PDF: ' + err.message);
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <SidebarLayout navItems={navItems} title="Executive Portal" subtitle="Reports & Anonymous Logs">
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="animate-spin text-indigo-600" size={36} />
          <p className="text-sm text-gray-500 font-medium">Loading reports & anonymous feedback repository...</p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout navItems={navItems} title="Executive Portal" subtitle="Reports & Anonymous Feedback Records">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header & Export Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                <ShieldCheck size={12} /> High Authority Audit Log
              </span>
              <span className="text-xs text-gray-400">Strictly Anonymous Logs</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Institutional Reports & Audit Logs</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Download formal governance reports and inspect authorized anonymous feedback submissions
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleDownloadFullPDF}
              disabled={generatingPDF}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/25 hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 active:scale-95"
            >
              {generatingPDF ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Download PDF Report
            </button>

            <a
              href={adminAPI.getCSVUrl()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 hover:bg-emerald-500 transition-all active:scale-95"
            >
              <FileSpreadsheet size={14} />
              Download CSV Report
            </a>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="glass rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search comments, faculty name, course, or subject..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto flex-wrap">
            <select
              value={selectedFaculty}
              onChange={e => setSelectedFaculty(e.target.value)}
              className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Faculty</option>
              {facultyList.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>

            <select
              value={selectedSemester}
              onChange={e => setSelectedSemester(e.target.value)}
              className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                <option key={s} value={s.toString()}>Semester {s}</option>
              ))}
            </select>

            <select
              value={minRating}
              onChange={e => setMinRating(e.target.value)}
              className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="0">All Ratings</option>
              <option value="4.0">&gt;= 4.0 Stars</option>
              <option value="4.5">&gt;= 4.5 Stars</option>
              <option value="3.0">&lt; 4.0 Stars</option>
            </select>
          </div>
        </div>

        {/* Privacy Highlight Banner */}
        <div className="rounded-2xl p-4 bg-gradient-to-r from-indigo-500/10 via-emerald-500/10 to-purple-500/10 border border-indigo-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck size={20} className="text-emerald-500 flex-shrink-0" />
            <div className="text-xs text-gray-600 dark:text-gray-300">
              <strong className="text-gray-900 dark:text-white">Anti-Identity Guarantee Confirmed:</strong> Every feedback record displayed below is stripped of student name, student ID, email, IP, and personal session identity at submission. Records only link to faculty and curriculum subject.
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-xl shadow-xs">
            {filtered.length} Submissions Logged
          </span>
        </div>

        {/* Anonymous Feedback Records Table */}
        <div className="glass rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50/80 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 text-gray-500 font-bold uppercase tracking-wider">
                  <th className="py-3.5 pl-4">Record ID</th>
                  <th className="py-3.5">Faculty</th>
                  <th className="py-3.5">Subject & Term</th>
                  <th className="py-3.5 text-center">Score</th>
                  <th className="py-3.5">Anonymous Comments & AI Sentiment</th>
                  <th className="py-3.5 pr-4 text-right">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {filtered.map(fb => {
                  const avg = fb.averageRating || 0;
                  const avgColor = avg >= 4.5 ? 'text-emerald-600' : avg >= 4.0 ? 'text-indigo-600' : avg >= 3.0 ? 'text-amber-500' : 'text-rose-500';
                  
                  return (
                    <tr key={fb.feedbackId} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="py-3.5 pl-4 font-mono font-bold text-gray-500 text-[11px]">
                        {fb.feedbackId.slice(0, 10)}...
                      </td>
                      <td className="py-3.5 font-bold text-gray-900 dark:text-white">
                        {fb.facultyName}
                      </td>
                      <td className="py-3.5">
                        <span className="font-semibold text-gray-800 dark:text-gray-200 block">{fb.subjectName}</span>
                        <span className="text-[11px] text-gray-400">Sem {fb.semester} • {fb.branch}</span>
                      </td>
                      <td className="py-3.5 text-center">
                        <div className={`text-sm font-black flex items-center justify-center gap-0.5 ${avgColor}`}>
                          {avg.toFixed(1)} <Star size={12} className="fill-current" />
                        </div>
                      </td>
                      <td className="py-3.5 max-w-md">
                        <div className="space-y-1.5">
                          {fb.positiveComment && (
                            <div className="flex items-start gap-1.5">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex-shrink-0">
                                {fb.positiveSentiment?.label || 'Positive'}
                              </span>
                              <p className="text-gray-700 dark:text-gray-300 italic text-[11px] line-clamp-2">
                                "{fb.positiveComment}"
                              </p>
                            </div>
                          )}
                          {fb.improvementComment && (
                            <div className="flex items-start gap-1.5">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex-shrink-0">
                                {fb.improvementSentiment?.label || 'Needs Attention'}
                              </span>
                              <p className="text-gray-700 dark:text-gray-300 italic text-[11px] line-clamp-2">
                                "{fb.improvementComment}"
                              </p>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 text-right text-gray-400 text-[11px] font-mono whitespace-nowrap">
                        {new Date(fb.submittedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="p-8 text-center text-sm text-gray-400">
              No anonymous feedback records matching the selected criteria.
            </div>
          )}
        </div>

      </div>
    </SidebarLayout>
  );
}
