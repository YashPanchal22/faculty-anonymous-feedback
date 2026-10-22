import { useState, useEffect } from 'react';
import SidebarLayout from '../../components/SidebarLayout';
import { adminAPI } from '../../services/api';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  Settings as SettingsIcon,
  Search,
  Filter,
  Star,
  Award,
  BookOpen,
  ChevronRight,
  X,
  Sparkles,
  AlertCircle,
  Download,
  Loader2,
  TrendingUp
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
  CartesianGrid
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AdminFaculty() {
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Drawer / Modal state for detailed deep dive
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);
  const [facultyDetail, setFacultyDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Academic Catalog', path: '/admin/catalog', icon: <BookOpen size={18} /> },
    { label: 'Faculty Directory', path: '/admin/faculty', icon: <Users size={18} /> },
    { label: 'Deep Analytics', path: '/admin/analytics', icon: <BarChart3 size={18} /> },
    { label: 'Reports & Logs', path: '/admin/reports', icon: <FileText size={18} /> },
    { label: 'System Settings', path: '/admin/settings', icon: <SettingsIcon size={18} /> },
  ];

  useEffect(() => {
    adminAPI.getAllFaculty()
      .then(res => setFacultyList(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openFacultyDetail = (id: string) => {
    setSelectedFacultyId(id);
    setDetailLoading(true);
    adminAPI.getFacultyDetail(id)
      .then(res => setFacultyDetail(res.data))
      .catch(() => {})
      .finally(() => setDetailLoading(false));
  };

  const closeFacultyDetail = () => {
    setSelectedFacultyId(null);
    setFacultyDetail(null);
  };

  const handleDownloadSingleReport = () => {
    if (!facultyDetail) return;
    const fac = facultyDetail.faculty;
    const doc = new jsPDF();

    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, 210, 32, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('INSTITUTIONAL FACULTY EVALUATION REPORT', 14, 16);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Faculty: ${fac.name} | ${fac.designation} (${fac.department})`, 14, 24);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Executive Summary', 14, 42);

    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Evaluation Result']],
      body: [
        ['Overall Rating', `${facultyDetail.overallAverage ? facultyDetail.overallAverage.toFixed(2) : 'N/A'} / 5.00`],
        ['Performance Classification', facultyDetail.category],
        ['Total Anonymous Feedback Submissions', `${facultyDetail.totalResponses}`],
        ['Department', fac.department],
        ['Evaluation Period', 'Current Academic Term'],
      ],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
    });

    const currentY = (doc as any).lastAutoTable.finalY + 10;
    doc.text('Parameter Evaluation Breakdown', 14, currentY);

    const paramRows = (facultyDetail.parameterAverages || []).map((p: any) => [
      p.label,
      `${p.average.toFixed(2)} / 5.00`,
      p.average >= 4.5 ? 'Top Tier' : p.average >= 4.0 ? 'Strong' : p.average >= 3.0 ? 'Satisfactory' : 'Action Required'
    ]);

    autoTable(doc, {
      startY: currentY + 4,
      head: [['Evaluation Parameter', 'Score', 'Institutional Benchmark']],
      body: paramRows,
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
    });

    const commentY = (doc as any).lastAutoTable.finalY + 10;
    doc.text('Authorized Anonymous Student Feedback Samples', 14, commentY);

    const commentRows = (facultyDetail.commentSentiments || []).slice(0, 10).map((c: any) => [
      c.text,
      c.sentiment.label
    ]);

    autoTable(doc, {
      startY: commentY + 4,
      head: [['Anonymous Feedback Remark', 'AI Sentiment']],
      body: commentRows.length > 0 ? commentRows : [['No qualitative comments recorded.', 'N/A']],
      theme: 'striped',
      headStyles: { fillColor: [129, 140, 248] },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text('Identity Protection Notice: Student identifiers have been completely stripped prior to recording.', 14, finalY);

    doc.save(`Admin_Faculty_Report_${fac.id}.pdf`);
  };

  const departments = ['All', ...Array.from(new Set(facultyList.map(f => f.department)))];
  const categories = [
    'All',
    'Top Rated Faculty',
    'Strong Performance',
    'Good Performance',
    'Needs Improvement',
    'Insufficient Responses',
  ];

  const filtered = facultyList.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.designation.toLowerCase().includes(search.toLowerCase()) ||
      f.department.toLowerCase().includes(search.toLowerCase());
    const matchesDept = selectedDept === 'All' || f.department === selectedDept;
    const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;
    return matchesSearch && matchesDept && matchesCategory;
  });

  if (loading) {
    return (
      <SidebarLayout navItems={navItems} title="Executive Portal" subtitle="Faculty Directory">
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 className="animate-spin text-indigo-600" size={36} />
          <p className="text-sm text-gray-500 font-medium">Loading faculty directory...</p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout navItems={navItems} title="Executive Portal" subtitle="Faculty Directory & Profiles">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Faculty Performance Directory</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Complete faculty roster with aggregated student feedback telemetry and individual deep-dives
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin/catalog"
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <BookOpen size={15} /> Add / Manage Catalog
            </a>
            <div className="text-xs font-semibold text-gray-500">
              Showing <span className="text-indigo-600 dark:text-indigo-400 font-bold">{filtered.length}</span> of {facultyList.length} faculty
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="glass rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search faculty name, designation, or department..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {departments.map(d => (
                <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
              ))}
            </select>

            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Faculty Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(fac => (
            <div
              key={fac.id}
              onClick={() => openFacultyDetail(fac.id)}
              className="glass rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                      {fac.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {fac.name}
                      </h3>
                      <p className="text-[11px] text-gray-400">{fac.designation}</p>
                    </div>
                  </div>

                  <span
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-xs whitespace-nowrap"
                    style={{ backgroundColor: fac.categoryColor }}
                  >
                    {fac.category}
                  </span>
                </div>

                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mb-3">
                  {fac.department}
                </p>

                {/* Assigned Courses Chips */}
                <div className="space-y-1 mb-4">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <BookOpen size={12} /> Assigned Courses:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {fac.subjects.slice(0, 2).map((s: any) => (
                      <span key={s.id} className="text-[11px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium">
                        {s.code}: {s.name}
                      </span>
                    ))}
                    {fac.subjects.length > 2 && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-400 font-medium">
                        +{fac.subjects.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Stat Row */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400">Anonymous Reviews</span>
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    {fac.totalResponses} {fac.totalResponses === 1 ? 'submission' : 'submissions'}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-right">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Rating</span>
                    <span className="text-base font-black" style={{ color: fac.categoryColor }}>
                      {fac.overallAverage ? fac.overallAverage.toFixed(2) : '—'}
                    </span>
                  </div>
                  <ChevronRight size={18} className="text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FACULTY DETAIL MODAL / DRAWER */}
        {selectedFacultyId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 dark:border-gray-800 relative p-6 space-y-6">
              
              {/* Modal Close Button */}
              <button
                onClick={closeFacultyDetail}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>

              {detailLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="animate-spin text-indigo-600" size={36} />
                  <p className="text-sm text-gray-500 font-medium">Fetching faculty analytics & sentiment summaries...</p>
                </div>
              ) : facultyDetail ? (
                <>
                  {/* Modal Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-xl font-black shadow-lg shadow-indigo-500/25">
                        {facultyDetail.faculty?.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-extrabold text-gray-900 dark:text-white">
                            {facultyDetail.faculty?.name}
                          </h3>
                          <span
                            className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-xs"
                            style={{ backgroundColor: facultyDetail.categoryColor }}
                          >
                            {facultyDetail.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{facultyDetail.faculty?.designation} • {facultyDetail.faculty?.department}</p>
                      </div>
                    </div>

                    <button
                      onClick={handleDownloadSingleReport}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-md shadow-indigo-500/25 hover:bg-indigo-500 transition-all self-start sm:self-center"
                    >
                      <Download size={14} />
                      Export Faculty PDF
                    </button>
                  </div>

                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center">
                      <span className="text-xs text-gray-400 font-medium">Cumulative Rating</span>
                      <div className="text-2xl font-black" style={{ color: facultyDetail.categoryColor }}>
                        {facultyDetail.overallAverage ? facultyDetail.overallAverage.toFixed(2) : '—'} / 5.0
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center">
                      <span className="text-xs text-gray-400 font-medium">Anonymous Responses</span>
                      <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                        {facultyDetail.totalResponses}
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-center">
                      <span className="text-xs text-gray-400 font-medium">Teaching Courses</span>
                      <div className="text-2xl font-black text-purple-600 dark:text-purple-400">
                        {facultyDetail.faculty?.subjects?.length || 0}
                      </div>
                    </div>
                  </div>

                  {/* Parameter Evaluation Bars */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Parameter Performance Breakdown
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(facultyDetail.parameterAverages || []).map((p: any) => {
                        const pct = (p.average / 5) * 100;
                        return (
                          <div key={p.key} className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/20">
                            <div className="flex justify-between text-xs font-semibold mb-1">
                              <span className="text-gray-700 dark:text-gray-300">{p.label}</span>
                              <span className="font-bold text-gray-900 dark:text-white">{p.average.toFixed(2)}/5.0</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* AI Themes & Synthesized Strengths */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border-l-4 border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/10 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <Sparkles size={14} /> Synthesized Strengths
                      </div>
                      <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-300">
                        {(facultyDetail.themes?.strengths || []).map((s: string, idx: number) => (
                          <li key={idx}>✓ {s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl border-l-4 border-amber-500 bg-amber-50/20 dark:bg-amber-950/10 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
                        <AlertCircle size={14} /> Areas for Attention
                      </div>
                      <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-300">
                        {(facultyDetail.themes?.improvements || []).map((s: string, idx: number) => (
                          <li key={idx}>• {s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Authorized Anonymous Student Comments (with sentiment analysis) */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        Authorized Anonymous Student Comments (High Authority View)
                      </h4>
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                        🔒 Identity Shielded
                      </span>
                    </div>

                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {(facultyDetail.commentSentiments || []).length > 0 ? (
                        facultyDetail.commentSentiments.map((cs: any, idx: number) => {
                          const tagBg = cs.sentiment?.label === 'Positive' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : cs.sentiment?.label === 'Needs Attention' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
                          return (
                            <div key={idx} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex items-start justify-between gap-3 text-xs">
                              <p className="text-gray-700 dark:text-gray-300 italic">
                                "{cs.text}"
                              </p>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${tagBg}`}>
                                {cs.sentiment?.label}
                              </span>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-xs text-gray-400 italic">No comments submitted for this faculty member yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Privacy reminder */}
                  <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800/80 text-[11px] text-gray-500">
                    <strong>Admin Notice:</strong> In accordance with the Anti-Identity Design specification, student identifiers were not stored at submission time and are strictly inaccessible even within executive analytics.
                  </div>
                </>
              ) : null}

            </div>
          </div>
        )}

      </div>
    </SidebarLayout>
  );
}
