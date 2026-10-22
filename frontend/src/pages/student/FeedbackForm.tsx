import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarLayout from '../../components/SidebarLayout';
import { studentAPI } from '../../services/api';
import {
  LayoutDashboard,
  MessageSquarePlus,
  Star,
  Loader2,
  Send,
  Building,
  ExternalLink,
  ShieldCheck,
  BookOpen,
  User,
  GraduationCap,
  Calendar,
  CheckCircle2
} from 'lucide-react';

const PARAMS = [
  { key: 'subjectKnowledge', label: 'Subject Knowledge', desc: 'Mastery over subject, command of concepts, and domain depth' },
  { key: 'clarity', label: 'Explanation / Clarity', desc: 'Ability to explain complex concepts clearly and systematically' },
  { key: 'communication', label: 'Communication', desc: 'Audibility, articulation, responsiveness, and open dialogue' },
  { key: 'engagement', label: 'Student Engagement', desc: 'Encouraging classroom interaction, queries, and active learning' },
  { key: 'punctuality', label: 'Punctuality & Regularity', desc: 'Adherence to scheduled lecture timetable and syllabus coverage' },
  { key: 'doubtResolution', label: 'Doubt Resolution', desc: 'Availability and patience in clarifying student doubts' },
  { key: 'practicalExamples', label: 'Practical / Real-World Examples', desc: 'Application of real-world industry case studies and practical demonstrations' },
  { key: 'overallSatisfaction', label: 'Overall Learning Satisfaction', desc: 'Overall value, educational impact, and academic mentorship' },
];

const STAR_LABELS = ['', 'Very Poor', 'Poor', 'Average', 'Good', 'Excellent'];

export default function FeedbackForm() {
  const navigate = useNavigate();
  const navItems = [
    { label: 'Overview', path: '/student/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Submit Course Evaluation', path: '/student/feedback', icon: <MessageSquarePlus size={18} /> },
  ];

  const [programs, setPrograms] = useState<any[]>([]);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [facultyList, setFacultyList] = useState<any[]>([]);

  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');

  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [positiveComment, setPositiveComment] = useState('');
  const [improvementComment, setImprovementComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load programs on mount
  useEffect(() => {
    studentAPI.getPrograms()
      .then(res => setPrograms(res.data))
      .catch(() => {});
  }, []);

  // Load semesters when program changes
  useEffect(() => {
    if (!selectedProgram) {
      setSemesters([]);
      return;
    }
    studentAPI.getSemesters(selectedProgram)
      .then(res => setSemesters(res.data))
      .catch(() => {});
    
    setSelectedSemester('');
    setSelectedSubject('');
    setSelectedFaculty('');
    setSubjects([]);
    setFacultyList([]);
  }, [selectedProgram]);

  // Load subjects & faculty when semester changes
  useEffect(() => {
    if (!selectedProgram || !selectedSemester) {
      setSubjects([]);
      setFacultyList([]);
      return;
    }
    const semInt = parseInt(selectedSemester, 10);
    studentAPI.getSubjects(selectedProgram, semInt)
      .then(res => setSubjects(res.data))
      .catch(() => {});

    // Pre-load all faculty (sirs) teaching in this program & semester
    studentAPI.getFaculty('', selectedProgram, semInt)
      .then(res => setFacultyList(res.data))
      .catch(() => {});
    
    setSelectedSubject('');
    setSelectedFaculty('');
  }, [selectedSemester, selectedProgram]);

  // Load faculty when subject changes
  useEffect(() => {
    if (!selectedSubject) {
      if (selectedProgram && selectedSemester) {
        studentAPI.getFaculty('', selectedProgram, parseInt(selectedSemester, 10))
          .then(res => setFacultyList(res.data))
          .catch(() => {});
      } else {
        setFacultyList([]);
      }
      setSelectedFaculty('');
      return;
    }

    const currentSub = subjects.find(s => s.id === selectedSubject);

    studentAPI.getFaculty(selectedSubject, selectedProgram, parseInt(selectedSemester, 10))
      .then(res => {
        setFacultyList(res.data);
        // Auto-select the assigned instructor (sir) if directly designated or single faculty
        if (currentSub?.facultyId && res.data.some((f: any) => f.id === currentSub.facultyId)) {
          setSelectedFaculty(currentSub.facultyId);
        } else if (res.data.length === 1) {
          setSelectedFaculty(res.data[0].id);
        }
      })
      .catch(() => {});
  }, [selectedSubject, selectedProgram, selectedSemester, subjects]);

  const setRating = (param: string, value: number) => {
    setRatings(prev => ({ ...prev, [param]: value }));
  };

  const allRated = PARAMS.every(p => ratings[p.key] && ratings[p.key] >= 1);
  const formComplete = selectedProgram && selectedSemester && selectedSubject && selectedFaculty && allRated;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formComplete) {
      setError('Please complete all 4 course selections and evaluate all 8 parameters.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await studentAPI.submitFeedback({
        facultyId: selectedFaculty,
        subjectId: selectedSubject,
        semester: parseInt(selectedSemester, 10),
        branch: selectedProgram,
        ratings,
        positiveComment,
        improvementComment,
      });
      navigate('/student/success', { state: { feedbackId: res.feedbackId } });
    } catch (err: any) {
      setError(err.message || 'Submission failed. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  const selectedProgObj = programs.find((p: any) => p.id === selectedProgram);
  const selectedFac = facultyList.find((f: any) => f.id === selectedFaculty);
  const selectedSub = subjects.find((s: any) => s.id === selectedSubject);

  return (
    <SidebarLayout navItems={navItems} title="Student Academic Portal" subtitle="Submit Anonymous Course Evaluation">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header with Official University Link */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center gap-1 uppercase tracking-wider">
                <Building size={11} /> Official Curriculum Structure
              </span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <Building size={13} />
                <span>Apex University Academic Catalog</span>
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              Course & Faculty Performance Evaluation
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select your enrolled program, semester, subject, and instructor according to the university academic catalog.
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-700 dark:text-emerald-300 font-bold self-start sm:self-center flex-shrink-0">
            <ShieldCheck size={14} />
            <span>Anonymous Ingestion</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* 1. SELECTION CASCADE: Program -> Semester -> Subject -> Faculty */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap size={18} className="text-indigo-600" />
                  1. Select Course & Faculty
                </h3>
                <p className="text-xs text-slate-400">
                  Cascading selection automatically retrieves official curriculum and assigned professors
                </p>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:block">
                Step 1 of 3
              </span>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              
              {/* Program Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Program *
                </label>
                <select
                  value={selectedProgram}
                  onChange={e => setSelectedProgram(e.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  required
                >
                  <option value="">-- Select Program --</option>
                  {programs.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  All university academic degree programs
                </p>
              </div>

              {/* Semester Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Semester *
                </label>
                <select
                  value={selectedSemester}
                  onChange={e => setSelectedSemester(e.target.value)}
                  disabled={!selectedProgram}
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:opacity-50"
                  required
                >
                  <option value="">-- Select Semester --</option>
                  {semesters.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  {selectedProgram ? `Choose from Semesters 1 to ${selectedProgObj?.totalSemesters || 6}` : 'Select program first'}
                </p>
              </div>

              {/* Subject / Course Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Subject / Course *
                </label>
                <select
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                  disabled={!selectedSemester}
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:opacity-50"
                  required
                >
                  <option value="">-- Select Subject --</option>
                  {subjects.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}{s.facultyName ? ` — (${s.facultyName})` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  {selectedSemester ? `${subjects.length} subjects found for Semester ${selectedSemester}` : 'Select semester first'}
                </p>
              </div>

              {/* Faculty / Sir Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Faculty / Sir / Professor *</span>
                  {selectedFac && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold tracking-normal">
                      ✓ Assigned Sir
                    </span>
                  )}
                </label>
                <select
                  value={selectedFaculty}
                  onChange={e => setSelectedFaculty(e.target.value)}
                  disabled={!selectedSemester}
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:opacity-50"
                  required
                >
                  <option value="">-- Select Faculty / Sir --</option>
                  {facultyList.map((f: any) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.designation})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  {selectedSubject
                    ? (selectedFac
                        ? `Assigned Course Faculty: ${selectedFac.name} (${selectedFac.designation})`
                        : `${facultyList.length} faculty (sir) assigned for this subject`)
                    : (selectedSemester
                        ? `${facultyList.length} faculty (sirs) teaching in Semester ${selectedSemester}`
                        : 'Select semester first')}
                </p>
              </div>

            </div>

            {/* Selected Evaluation Confirmation Badge */}
            {selectedFac && selectedSub && (
              <div className="p-4 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">
                    {selectedFac.name.charAt(0)}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block">
                      Target Faculty / Sir:
                    </span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      {selectedFac.name} <span className="text-xs font-medium text-slate-500">({selectedFac.designation})</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {selectedSub.code}: {selectedSub.name} • Semester {selectedSemester}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-xs self-start sm:self-center">
                  <CheckCircle2 size={13} /> Ready to evaluate
                </div>
              </div>
            )}

          </div>

          {/* 2. RATING PARAMETERS */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  2. Rate on 8 Pedagogy Parameters
                </h3>
                <p className="text-xs text-slate-400">
                  Select stars from 1 (Very Poor) to 5 (Excellent). All 8 parameters are required for evaluation validity.
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-lg">
                {Object.keys(ratings).length}/8 Rated
              </span>
            </div>

            <div className="space-y-3">
              {PARAMS.map(p => (
                <div
                  key={p.key}
                  className="p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {p.label} *
                      </span>
                      <span className="text-[11px] text-slate-400 block sm:inline sm:ml-2">
                        {p.desc}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 min-w-[90px] sm:text-right">
                      {ratings[p.key] ? `${ratings[p.key]} ★ ${STAR_LABELS[ratings[p.key]]}` : 'Unrated'}
                    </span>
                  </div>

                  <div className="flex gap-1.5 sm:gap-2">
                    {[1, 2, 3, 4, 5].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setRating(p.key, val)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          ratings[p.key] === val
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-[1.02]'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        {val} <Star size={11} className={`inline ml-0.5 ${ratings[p.key] === val ? 'fill-amber-300 text-amber-300' : 'text-slate-300'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. CONSTRUCTIVE QUALITATIVE COMMENTS */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                3. Constructive Academic Remarks (Optional)
              </h3>
              <p className="text-xs text-slate-400">
                Comments are analyzed anonymously for recurring pedagogical strengths and areas for institutional support.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  What did the faculty do well in this course?
                </label>
                <textarea
                  value={positiveComment}
                  onChange={e => setPositiveComment(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-medium"
                  placeholder="e.g. Explained complex database normalization clearly, shared great code examples, always patient in doubt solving..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  What constructive improvements could be made?
                </label>
                <textarea
                  value={improvementComment}
                  onChange={e => setImprovementComment(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-medium"
                  placeholder="e.g. More practical laboratory hands-on sessions, provide code repository references for semester projects..."
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !formComplete}
            className="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/25 transition-all disabled:opacity-40 flex items-center justify-center gap-2 active:scale-98"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Encrypting & Submitting Anonymous Evaluation...
              </>
            ) : (
              <>
                <Send size={16} />
                Submit Anonymous Evaluation to Apex University IQAC
              </>
            )}
          </button>
        </form>

      </div>
    </SidebarLayout>
  );
}
