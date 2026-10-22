// Student Controller - Programs, Subjects, Faculty selection, and Feedback submission
// CRITICAL: Feedback submission STRIPS all student identity before storage.

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');

function readJSON(file) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
}

function writeJSON(file, data) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), 'utf8');
}

// GET /api/programs
function getPrograms(req, res) {
  const programs = readJSON('programs.json');
  res.json({ success: true, data: programs });
}

// GET /api/semesters?program=bsc_ds
function getSemesters(req, res) {
  const { program } = req.query;
  const programs = readJSON('programs.json');
  const prog = programs.find(p => p.id === program || p.name === program || p.code === program);
  
  if (!prog) {
    return res.json({ success: true, data: [] });
  }

  const semesters = [];
  for (let i = 1; i <= prog.totalSemesters; i++) {
    semesters.push({ id: i, name: `Semester ${i}` });
  }
  res.json({ success: true, data: semesters });
}

// GET /api/subjects?semester=3&program=bsc_ds
function getSubjects(req, res) {
  const { semester, program } = req.query;
  const subjects = readJSON('subjects.json');
  const programs = readJSON('programs.json');
  
  let filtered = subjects;
  if (program) {
    const progObj = programs.find(p => p.id === program || p.name === program || p.code === program);
    const targetProgramName = progObj ? progObj.name : program;
    filtered = filtered.filter(s => s.program === targetProgramName || s.program === program);
  }
  if (semester) filtered = filtered.filter(s => s.semester === parseInt(semester, 10));

  res.json({ success: true, data: filtered });
}

// GET /api/faculty?subjectId=SUB009&program=bsc_ds&semester=3
function getFacultyForSubject(req, res) {
  const { subjectId, program, semester } = req.query;
  const faculty = readJSON('faculty.json');
  const subjects = readJSON('subjects.json');
  const programs = readJSON('programs.json');

  let targetProgName = program;
  if (program) {
    const progObj = programs.find(p => p.id === program || p.name === program || p.code === program);
    if (progObj) targetProgName = progObj.name;
  }

  let filtered = [];

  // 1. If subjectId is passed, find the specific faculty assigned to this subject
  if (subjectId) {
    const sub = subjects.find(s => s.id === subjectId || s.code === subjectId);
    if (sub && sub.facultyId) {
      const directFac = faculty.find(f => f.id === sub.facultyId);
      if (directFac) filtered.push(directFac);
    }
    const mapped = faculty.filter(f => f.subjects && f.subjects.includes(subjectId));
    mapped.forEach(f => {
      if (!filtered.some(item => item.id === f.id)) {
        filtered.push(f);
      }
    });

    if (filtered.length === 0 && sub && sub.department) {
      filtered = faculty.filter(f => f.department === sub.department);
    }
  }

  // 2. If subjectId is not passed, but program & semester are passed,
  // return all faculty teaching courses in that program and semester
  if (filtered.length === 0 && targetProgName && semester) {
    const semNum = parseInt(semester, 10);
    const semSubs = subjects.filter(s => (s.program === targetProgName || s.program === program) && s.semester === semNum);
    const semSubIds = semSubs.map(s => s.id);
    const semFacIds = semSubs.map(s => s.facultyId).filter(Boolean);

    filtered = faculty.filter(f => 
      semFacIds.includes(f.id) || (f.subjects && f.subjects.some(id => semSubIds.includes(id)))
    );

    if (filtered.length === 0 && semSubs.length > 0) {
      const dept = semSubs[0].department;
      if (dept) filtered = faculty.filter(f => f.department === dept);
    }
  }

  // 3. If only program is passed
  if (filtered.length === 0 && targetProgName) {
    const progSubs = subjects.filter(s => s.program === targetProgName || s.program === program);
    const progSubIds = progSubs.map(s => s.id);
    const progFacIds = progSubs.map(s => s.facultyId).filter(Boolean);

    filtered = faculty.filter(f => 
      progFacIds.includes(f.id) || (f.subjects && f.subjects.some(id => progSubIds.includes(id)))
    );

    if (filtered.length === 0) {
      const prog = programs.find(p => p.id === program);
      if (prog && prog.department) {
        filtered = faculty.filter(f => f.department === prog.department);
      }
    }
  }

  // 4. Safety fallback
  if (filtered.length === 0) {
    filtered = faculty;
  }

  // Deduplicate
  const seenIds = new Set();
  const sanitized = [];
  for (const f of filtered) {
    if (!seenIds.has(f.id)) {
      seenIds.add(f.id);
      sanitized.push({
        id: f.id,
        name: f.name,
        designation: f.designation,
        department: f.department
      });
    }
  }

  res.json({ success: true, data: sanitized });
}

// POST /api/feedback
// CRITICAL PRIVACY FUNCTION:
// This endpoint STRIPS ALL student identity before persisting feedback.
// The feedback record contains NO student name, ID, email, phone, or username.
function submitFeedback(req, res) {
  const { facultyId, subjectId, semester, branch, ratings, positiveComment, improvementComment } = req.body;

  // --- Validation ---
  if (!facultyId || !subjectId || !semester || !branch) {
    return res.status(400).json({ error: 'Faculty, subject, semester, and branch are required.' });
  }

  if (!ratings || typeof ratings !== 'object') {
    return res.status(400).json({ error: 'Ratings object is required.' });
  }

  const requiredParams = [
    'subjectKnowledge', 'clarity', 'communication', 'engagement',
    'punctuality', 'doubtResolution', 'practicalExamples', 'overallSatisfaction'
  ];

  for (const param of requiredParams) {
    const val = parseInt(ratings[param], 10);
    if (isNaN(val) || val < 1 || val > 5) {
      return res.status(400).json({ error: `Rating for "${param}" must be between 1 and 5.` });
    }
  }

  // Verify faculty exists
  const faculty = readJSON('faculty.json');
  if (!faculty.find(f => f.id === facultyId)) {
    return res.status(400).json({ error: 'Invalid faculty selection.' });
  }

  // --- Duplicate Prevention ---
  // Uses a privacy-preserving hashed token approach.
  // We hash the user's session token + facultyId + subjectId to create a one-way
  // anonymous duplicate check. This hash cannot be reversed to identify the student.
  const sessionToken = req.headers['x-anonymous-token'] || '';
  if (sessionToken) {
    const duplicateHash = crypto
      .createHash('sha256')
      .update(`${sessionToken}::${facultyId}::${subjectId}`)
      .digest('hex');

    const feedbacks = readJSON('feedback.json');
    // Check if this hash already exists (stored in a separate tracking file)
    let hashTracker = [];
    const hashFile = path.join(DATA_DIR, 'submission_hashes.json');
    try {
      hashTracker = JSON.parse(fs.readFileSync(hashFile, 'utf8'));
    } catch { hashTracker = []; }

    if (hashTracker.includes(duplicateHash)) {
      return res.status(409).json({
        error: 'You have already submitted feedback for this faculty-subject combination.'
      });
    }

    // Store hash (NOT the student identity)
    hashTracker.push(duplicateHash);
    fs.writeFileSync(hashFile, JSON.stringify(hashTracker, null, 2), 'utf8');
  }

  // --- Create Anonymous Feedback Record ---
  // PRIVACY: We deliberately DO NOT include any student-identifying information.
  // No studentId, no studentName, no email, no phone, no username.
  const validatedRatings = {};
  for (const param of requiredParams) {
    validatedRatings[param] = parseInt(ratings[param], 10);
  }

  const feedbackRecord = {
    feedbackId: uuidv4(),
    facultyId,
    subjectId,
    semester: parseInt(semester, 10),
    branch,
    ratings: validatedRatings,
    positiveComment: (positiveComment || '').trim().substring(0, 500),
    improvementComment: (improvementComment || '').trim().substring(0, 500),
    submittedAt: new Date().toISOString()
    // NOTE: No student identity fields are stored here.
    // This is intentional and critical for anonymity.
  };

  // Append to feedback database
  const feedbacks = readJSON('feedback.json');
  feedbacks.push(feedbackRecord);
  writeJSON('feedback.json', feedbacks);

  res.status(201).json({
    success: true,
    message: 'Anonymous feedback submitted successfully. Your identity has not been recorded.',
    feedbackId: feedbackRecord.feedbackId
  });
}

module.exports = { getPrograms, getSemesters, getSubjects, getFacultyForSubject, submitFeedback };
