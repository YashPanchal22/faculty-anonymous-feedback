import { useState, useEffect } from 'react';
import SidebarLayout from '../../components/SidebarLayout';
import { adminAPI } from '../../services/api';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  FileText,
  Settings as SettingsIcon,
  BookOpen,
  Plus,
  Trash2,
  Search,
  Filter,
  GraduationCap,
  Layers,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Copy,
  ExternalLink
} from 'lucide-react';

const DEPARTMENTS = [
  "Aeronautical Engineering",
  "Biotechnology Engineering",
  "Chemical Engineering",
  "Civil Engineering",
  "Computer Engineering",
  "Department of Animation & Multimedia",
  "Department of Aviation Technology",
  "Department of Commerce",
  "Department of Computer Applications",
  "Department of Legal Studies",
  "Department of Management Studies",
  "Department of Nursing",
  "Department of Pharmaceutical Sciences",
  "Department of Physiotherapy",
  "Department of Science & Mathematics",
  "Electrical Engineering",
  "Electronics & Communication Engineering",
  "Information Technology",
  "Mechanical Engineering"
];

const DESIGNATIONS = [
  "Professor & Head",
  "Professor & Chair",
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Senior Lecturer",
  "Lecturer",
  "Adjunct Faculty"
];

export default function CatalogManager() {
  const navItems = [
    { label: 'Overview', path: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Academic Catalog', path: '/admin/catalog', icon: <BookOpen size={18} /> },
    { label: 'Faculty Directory', path: '/admin/faculty', icon: <Users size={18} /> },
    { label: 'Deep Analytics', path: '/admin/analytics', icon: <BarChart3 size={18} /> },
    { label: 'Reports & Logs', path: '/admin/reports', icon: <FileText size={18} /> },
    { label: 'System Settings', path: '/admin/settings', icon: <SettingsIcon size={18} /> },
  ];

  const [activeTab, setActiveTab] = useState<'programs' | 'subjects' | 'faculty'>('programs');
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState<{ programs: any[]; subjects: any[]; faculty: any[] }>({
    programs: [],
    subjects: [],
    faculty: []
  });

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('All');
  const [selectedProgFilter, setSelectedProgFilter] = useState('All');
  const [selectedSemFilter, setSelectedSemFilter] = useState('All');

  // Modals state
  const [showProgramModal, setShowProgramModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showFacultyModal, setShowFacultyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Faculty Credentials popup
  const [newCredentials, setNewCredentials] = useState<{ username: string; defaultPassword: string; name: string } | null>(null);

  // Form states
  const [newProgram, setNewProgram] = useState({
    name: '',
    degree: "Bachelor's",
    department: DEPARTMENTS[4], // Computer Engineering
    durationYears: 4,
    totalSemesters: 8,
    code: ''
  });

  const [newSubject, setNewSubject] = useState({
    code: '',
    name: '',
    program: '',
    semester: 1,
    credits: 4,
    facultyId: ''
  });

  const [newFaculty, setNewFaculty] = useState({
    name: '',
    designation: DESIGNATIONS[4], // Assistant Professor
    department: DEPARTMENTS[4],
    email: '',
    phone: '',
    semesters: [1, 2]
  });

  const loadCatalog = () => {
    setLoading(true);
    adminAPI.getCatalog()
      .then(res => {
        setCatalog(res.data);
        if (res.data.programs.length > 0 && !newSubject.program) {
          setNewSubject(prev => ({ ...prev, program: res.data.programs[0].name }));
        }
        if (res.data.faculty.length > 0 && !newSubject.facultyId) {
          setNewSubject(prev => ({ ...prev, facultyId: res.data.faculty[0].id }));
        }
      })
      .catch(err => {
        setStatusMessage({ type: 'error', text: 'Failed to load catalog data: ' + err.message });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  // Handle Add Program
  const handleCreateProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProgram.name.trim()) return;
    setSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await adminAPI.createProgram(newProgram);
      setStatusMessage({ type: 'success', text: res.message });
      setShowProgramModal(false);
      setNewProgram({
        name: '',
        degree: "Bachelor's",
        department: DEPARTMENTS[4],
        durationYears: 4,
        totalSemesters: 8,
        code: ''
      });
      loadCatalog();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to create program.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Add Subject
  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.name.trim() || !newSubject.program || !newSubject.facultyId) return;
    setSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await adminAPI.createSubject(newSubject);
      setStatusMessage({ type: 'success', text: res.message });
      setShowSubjectModal(false);
      setNewSubject({
        code: '',
        name: '',
        program: catalog.programs[0]?.name || '',
        semester: 1,
        credits: 4,
        facultyId: catalog.faculty[0]?.id || ''
      });
      loadCatalog();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to create subject.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Add Faculty
  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaculty.name.trim()) return;
    setSubmitting(true);
    setStatusMessage(null);
    try {
      const res = await adminAPI.createFaculty(newFaculty);
      setShowFacultyModal(false);
      setNewCredentials({
        username: res.credentials.username,
        defaultPassword: res.credentials.defaultPassword,
        name: newFaculty.name
      });
      setNewFaculty({
        name: '',
        designation: DESIGNATIONS[4],
        department: DEPARTMENTS[4],
        email: '',
        phone: '',
        semesters: [1, 2]
      });
      loadCatalog();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to add faculty.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Deletions
  const handleDeleteProgram = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove the program "${name}"?`)) return;
    try {
      await adminAPI.deleteProgram(id);
      setStatusMessage({ type: 'success', text: `Program "${name}" removed.` });
      loadCatalog();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to delete program.' });
    }
  };

  const handleDeleteSubject = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove the subject "${name}"?`)) return;
    try {
      await adminAPI.deleteSubject(id);
      setStatusMessage({ type: 'success', text: `Subject "${name}" removed.` });
      loadCatalog();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to delete subject.' });
    }
  };

  const handleDeleteFaculty = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove faculty member "${name}"?`)) return;
    try {
      await adminAPI.deleteFaculty(id);
      setStatusMessage({ type: 'success', text: `Faculty member "${name}" removed.` });
      loadCatalog();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to delete faculty.' });
    }
  };

  // Filtered Programs
  const filteredPrograms = catalog.programs.filter(p => {
    const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.code || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDeptFilter === 'All' || p.department === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  // Filtered Subjects
  const filteredSubjects = catalog.subjects.filter(s => {
    const matchesSearch = (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (s.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (s.facultyName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProg = selectedProgFilter === 'All' || s.program === selectedProgFilter;
    const matchesSem = selectedSemFilter === 'All' || s.semester === parseInt(selectedSemFilter, 10);
    return matchesSearch && matchesProg && matchesSem;
  });

  // Filtered Faculty
  const filteredFaculty = catalog.faculty.filter(f => {
    const matchesSearch = (f.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (f.designation || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (f.email || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDeptFilter === 'All' || f.department === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <SidebarLayout navItems={navItems} title="Academic Catalog" subtitle="Apex University Curriculum & Faculty Management">
      
      {/* Header Banner & Quick Action Buttons */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-indigo-500/30 text-indigo-200 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-indigo-400/30">
              Institutional Admin Controls
            </span>
            <span className="text-xs text-slate-300 font-medium">Apex University Backend Live Storage</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Curriculum & Faculty Master Catalog
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Add, update, or remove Academic Programs, Semester Subjects, and assigned Faculty / Sirs. All additions persist instantly in backend data and reflect on Student Feedback cascading forms.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowProgramModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
          >
            <Plus size={16} /> Add Program
          </button>
          <button
            onClick={() => setShowSubjectModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
          >
            <Plus size={16} /> Add Subject
          </button>
          <button
            onClick={() => setShowFacultyModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-600 hover:bg-amber-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg transition-all"
          >
            <Plus size={16} /> Add Faculty / Sir
          </button>
        </div>
      </div>

      {/* Status Notifications */}
      {statusMessage && (
        <div
          className={`mb-6 p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-semibold transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
              : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-6 pb-2">
        <button
          onClick={() => { setActiveTab('programs'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'programs'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <GraduationCap size={16} />
          <span>Programs ({catalog.programs.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('subjects'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'subjects'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers size={16} />
          <span>Subjects & Assigned Sirs ({catalog.subjects.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('faculty'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'faculty'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UserCheck size={16} />
          <span>Faculty / Sirs ({catalog.faculty.length})</span>
        </button>
      </div>

      {/* Controls Bar (Search & Filter) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 mb-6 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder={
              activeTab === 'programs'
                ? 'Search program name or code...'
                : activeTab === 'subjects'
                ? 'Search subject name, code, or Sir...'
                : 'Search faculty name or designation...'
            }
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>

        {/* Tab specific dropdown filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {activeTab === 'programs' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Department:</span>
              <select
                value={selectedDeptFilter}
                onChange={e => setSelectedDeptFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="All">All Departments</option>
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}

          {activeTab === 'subjects' && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Program:</span>
                <select
                  value={selectedProgFilter}
                  onChange={e => setSelectedProgFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none max-w-[200px] truncate"
                >
                  <option value="All">All Programs</option>
                  {catalog.programs.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">Sem:</span>
                <select
                  value={selectedSemFilter}
                  onChange={e => setSelectedSemFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
                >
                  <option value="All">All</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <option key={s} value={s}>Sem {s}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {activeTab === 'faculty' && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">Department:</span>
              <select
                value={selectedDeptFilter}
                onChange={e => setSelectedDeptFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none"
              >
                <option value="All">All Departments</option>
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 gap-3">
          <Loader2 className="animate-spin text-indigo-600" size={36} />
          <p className="text-xs text-slate-500 font-semibold">Loading catalog from backend...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: PROGRAMS */}
          {activeTab === 'programs' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Program Name</th>
                      <th className="py-3.5 px-4">Code</th>
                      <th className="py-3.5 px-4">Degree</th>
                      <th className="py-3.5 px-4">Department</th>
                      <th className="py-3.5 px-4 text-center">Duration</th>
                      <th className="py-3.5 px-4 text-center">Semesters</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredPrograms.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          No academic programs match the criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredPrograms.map((prog) => (
                        <tr key={prog.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                            {prog.name}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                            {prog.code}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-medium">
                              {prog.degree || 'Degree'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                            {prog.department}
                          </td>
                          <td className="py-3.5 px-4 text-center font-medium text-slate-600 dark:text-slate-300">
                            {prog.durationYears || 4} Years
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold">
                              {prog.totalSemesters || 8} Sems
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteProgram(prog.id, prog.name)}
                              title="Delete Program"
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: SUBJECTS */}
          {activeTab === 'subjects' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Code</th>
                      <th className="py-3.5 px-4">Subject Title</th>
                      <th className="py-3.5 px-4">Program</th>
                      <th className="py-3.5 px-4 text-center">Sem</th>
                      <th className="py-3.5 px-4 text-center">Credits</th>
                      <th className="py-3.5 px-4">Assigned Faculty / Sir</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredSubjects.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          No subjects found for the selected program/semester.
                        </td>
                      </tr>
                    ) : (
                      filteredSubjects.map((sub) => (
                        <tr key={sub.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                            {sub.code}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                            {sub.name}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                            {sub.program}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              Sem {sub.semester}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-semibold text-slate-600 dark:text-slate-400">
                            {sub.credits || 4}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold">
                                {sub.facultyName || 'Unassigned'}
                              </span>
                              {sub.facultyDesignation && (
                                <span className="text-[10px] text-slate-400 hidden sm:inline">
                                  ({sub.facultyDesignation})
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteSubject(sub.id, sub.name)}
                              title="Delete Subject"
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: FACULTY */}
          {activeTab === 'faculty' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Faculty Member / Sir</th>
                      <th className="py-3.5 px-4">Designation</th>
                      <th className="py-3.5 px-4">Department</th>
                      <th className="py-3.5 px-4">Email</th>
                      <th className="py-3.5 px-4 text-center">Assigned Courses</th>
                      <th className="py-3.5 px-4 text-center">Semesters</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredFaculty.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          No faculty members match the criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredFaculty.map((fac) => (
                        <tr key={fac.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {fac.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {fac.id}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                            {fac.designation}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                            {fac.department}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-mono">
                            {fac.email || 'N/A'}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                              {fac.subjectCount || 0} Courses
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center font-semibold text-slate-600 dark:text-slate-300">
                            {Array.isArray(fac.semesters) ? fac.semesters.join(', ') : '1, 2'}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteFaculty(fac.id, fac.name)}
                              title="Delete Faculty"
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL 1: ADD PROGRAM */}
      {showProgramModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
                  <GraduationCap size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Academic Program</h3>
                  <p className="text-xs text-slate-400">Directly adds degree into backend programs catalog</p>
                </div>
              </div>
              <button onClick={() => setShowProgramModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProgram} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Program Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. M.Tech. Artificial Intelligence & Robotics"
                  value={newProgram.name}
                  onChange={e => setNewProgram({ ...newProgram, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">Official degree title without college prefix</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Program Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MTECH-AIR"
                    value={newProgram.code}
                    onChange={e => setNewProgram({ ...newProgram, code: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Degree Level
                  </label>
                  <select
                    value={newProgram.degree}
                    onChange={e => setNewProgram({ ...newProgram, degree: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Bachelor's">Bachelor's Degree</option>
                    <option value="Master's">Master's Degree</option>
                    <option value="Diploma">Diploma / Polytechnic</option>
                    <option value="Integrated">Integrated Degree (5 Years)</option>
                    <option value="Doctorate">Ph.D. / Doctoral</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Academic Department *
                </label>
                <select
                  value={newProgram.department}
                  onChange={e => setNewProgram({ ...newProgram, department: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Duration (Years)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={newProgram.durationYears}
                    onChange={e => setNewProgram({ ...newProgram, durationYears: parseInt(e.target.value, 10) || 4 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Total Semesters
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="12"
                    value={newProgram.totalSemesters}
                    onChange={e => setNewProgram({ ...newProgram, totalSemesters: parseInt(e.target.value, 10) || 8 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowProgramModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Save Program to Backend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD SUBJECT */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                  <Layers size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Subject / Course</h3>
                  <p className="text-xs text-slate-400">Assigns subject to official curriculum and dedicated Sir</p>
                </div>
              </div>
              <button onClick={() => setShowSubjectModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Academic Program *
                </label>
                <select
                  required
                  value={newSubject.program}
                  onChange={e => setNewSubject({ ...newSubject, program: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {catalog.programs.map(p => (
                    <option key={p.id} value={p.name}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Semester (1 to 8) *
                  </label>
                  <select
                    value={newSubject.semester}
                    onChange={e => setNewSubject({ ...newSubject, semester: parseInt(e.target.value, 10) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Subject Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE401"
                    value={newSubject.code}
                    onChange={e => setNewSubject({ ...newSubject, code: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Subject Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Natural Language Processing"
                  value={newSubject.name}
                  onChange={e => setNewSubject({ ...newSubject, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Credits
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={newSubject.credits}
                    onChange={e => setNewSubject({ ...newSubject, credits: parseInt(e.target.value, 10) || 4 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Assigned Faculty / Sir *
                  </label>
                  <select
                    required
                    value={newSubject.facultyId}
                    onChange={e => setNewSubject({ ...newSubject, facultyId: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {catalog.faculty.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.designation})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Save Subject to Backend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD FACULTY / SIR */}
      {showFacultyModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600">
                  <UserCheck size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Faculty / Sir</h3>
                  <p className="text-xs text-slate-400">Generates faculty profile & system login credentials</p>
                </div>
              </div>
              <button onClick={() => setShowFacultyModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateFaculty} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Faculty Name (with Title) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prof. Aniket Dave or Dr. Neha Patel"
                  value={newFaculty.name}
                  onChange={e => setNewFaculty({ ...newFaculty, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Designation *
                  </label>
                  <select
                    value={newFaculty.designation}
                    onChange={e => setNewFaculty({ ...newFaculty, designation: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                  >
                    {DESIGNATIONS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Department *
                  </label>
                  <select
                    value={newFaculty.department}
                    onChange={e => setNewFaculty({ ...newFaculty, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none truncate"
                  >
                    {DEPARTMENTS.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Institutional Email
                  </label>
                  <input
                    type="email"
                    placeholder="Auto-generated if empty"
                    value={newFaculty.email}
                    onChange={e => setNewFaculty({ ...newFaculty, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 00000"
                    value={newFaculty.phone}
                    onChange={e => setNewFaculty({ ...newFaculty, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Teaching Semesters
                </label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <label
                      key={s}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
                        newFaculty.semesters.includes(s)
                          ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={newFaculty.semesters.includes(s)}
                        onChange={e => {
                          if (e.target.checked) {
                            setNewFaculty({ ...newFaculty, semesters: [...newFaculty.semesters, s].sort((a, b) => a - b) });
                          } else {
                            setNewFaculty({ ...newFaculty, semesters: newFaculty.semesters.filter(x => x !== s) });
                          }
                        }}
                      />
                      Sem {s}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowFacultyModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-md disabled:opacity-50"
                >
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Add Sir & Generate Login
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: FACULTY CREDENTIALS DISPLAY */}
      {newCredentials && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Faculty Added to Backend!
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Account created for <strong>{newCredentials.name}</strong>. Provide these login credentials to the faculty member:
            </p>

            <div className="my-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Username:</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{newCredentials.username}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Default Password:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{newCredentials.defaultPassword}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Portal Role:</span>
                <span className="font-bold text-amber-600">faculty</span>
              </div>
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(`Username: ${newCredentials.username} | Password: ${newCredentials.defaultPassword}`);
                alert('Credentials copied to clipboard!');
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 mb-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold transition-all"
            >
              <Copy size={14} /> Copy Credentials
            </button>

            <button
              onClick={() => setNewCredentials(null)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </SidebarLayout>
  );
}
