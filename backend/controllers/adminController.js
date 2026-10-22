// Admin Controller - Full system analytics, reports, and anonymous feedback access.
// Only High Authority / Admin role can access these endpoints.

const fs = require('fs');
const path = require('path');
const { calculateFacultyPerformance, getDashboardAnalytics, PARAM_LABELS } = require('../services/analyticsService');
const { analyzeSentiment } = require('../services/sentimentService');

const DATA_DIR = path.join(__dirname, '..', 'data');

function readJSON(file) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
}

function writeJSON(file, data) {
  fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), 'utf8');
}

// GET /api/admin/dashboard - System-wide KPIs and analytics
function getDashboard(req, res) {
  try {
    const analytics = getDashboardAnalytics();
    res.json({ success: true, data: analytics });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute dashboard analytics: ' + err.message });
  }
}

// GET /api/admin/faculty - All faculty with aggregated stats
function getAllFaculty(req, res) {
  try {
    const faculty = readJSON('faculty.json');
    const subjects = readJSON('subjects.json');
    const settings = readJSON('settings.json');

    const enriched = faculty.map(fac => {
      const perf = calculateFacultyPerformance(fac.id);
      return {
        id: fac.id,
        name: fac.name,
        designation: fac.designation,
        department: fac.department,
        subjects: fac.subjects.map(sid => {
          const s = subjects.find(sub => sub.id === sid);
          return s ? { id: s.id, code: s.code, name: s.name, semester: s.semester } : null;
        }).filter(Boolean),
        semesters: fac.semesters,
        totalResponses: perf ? perf.totalResponses : 0,
        overallAverage: perf ? perf.overallAverage : 0,
        category: perf ? perf.category : 'Insufficient Responses',
        categoryColor: perf ? perf.categoryColor : '#64748b'
      };
    });

    enriched.sort((a, b) => b.overallAverage - a.overallAverage);

    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load faculty data: ' + err.message });
  }
}

// GET /api/admin/faculty/:id/detail - Deep-dive for one faculty member
function getFacultyDetail(req, res) {
  try {
    const perf = calculateFacultyPerformance(req.params.id);
    if (!perf) {
      return res.status(404).json({ error: 'Faculty not found.' });
    }

    // Admin gets everything including anonymous comment sentiments
    res.json({
      success: true,
      data: {
        ...perf,
        commentSentiments: perf._commentSentiments
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load faculty detail: ' + err.message });
  }
}

// GET /api/admin/analytics - Charts data
function getAnalytics(req, res) {
  try {
    const analytics = getDashboardAnalytics();
    
    // Subject-wise averages
    const feedbacks = readJSON('feedback.json');
    const subjects = readJSON('subjects.json');

    const subjectMap = {};
    for (const fb of feedbacks) {
      if (!subjectMap[fb.subjectId]) {
        const sub = subjects.find(s => s.id === fb.subjectId);
        subjectMap[fb.subjectId] = {
          id: fb.subjectId,
          name: sub ? sub.name : 'Unknown',
          code: sub ? sub.code : '',
          totalRating: 0,
          count: 0
        };
      }
      const vals = Object.values(fb.ratings);
      subjectMap[fb.subjectId].totalRating += vals.reduce((a, b) => a + b, 0) / vals.length;
      subjectMap[fb.subjectId].count++;
    }

    const subjectAverages = Object.values(subjectMap).map(s => ({
      ...s,
      average: parseFloat((s.totalRating / s.count).toFixed(2))
    })).sort((a, b) => b.average - a.average);

    res.json({
      success: true,
      data: {
        ...analytics,
        subjectAverages
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load analytics: ' + err.message });
  }
}

// GET /api/admin/feedback - Anonymized feedback list with comments
// NOTE: No student identity fields exist in the records.
function getAnonymousFeedback(req, res) {
  try {
    const feedbacks = readJSON('feedback.json');
    const faculty = readJSON('faculty.json');
    const subjects = readJSON('subjects.json');

    let { facultyId, subjectId, semester, branch, minRating, maxRating } = req.query;

    let filtered = [...feedbacks];

    if (facultyId) filtered = filtered.filter(f => f.facultyId === facultyId);
    if (subjectId) filtered = filtered.filter(f => f.subjectId === subjectId);
    if (semester) filtered = filtered.filter(f => f.semester === parseInt(semester, 10));
    if (branch) filtered = filtered.filter(f => f.branch === branch);
    if (minRating) {
      filtered = filtered.filter(f => {
        const avg = Object.values(f.ratings).reduce((a, b) => a + b, 0) / Object.values(f.ratings).length;
        return avg >= parseFloat(minRating);
      });
    }
    if (maxRating) {
      filtered = filtered.filter(f => {
        const avg = Object.values(f.ratings).reduce((a, b) => a + b, 0) / Object.values(f.ratings).length;
        return avg <= parseFloat(maxRating);
      });
    }

    // Enrich with faculty/subject names, add sentiment, sort newest first
    const enriched = filtered.map(fb => {
      const fac = faculty.find(f => f.id === fb.facultyId);
      const sub = subjects.find(s => s.id === fb.subjectId);
      const allRatings = Object.values(fb.ratings);
      const avgRating = parseFloat((allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(2));

      return {
        feedbackId: fb.feedbackId,
        facultyName: fac ? fac.name : 'Unknown',
        facultyId: fb.facultyId,
        subjectName: sub ? sub.name : 'Unknown',
        subjectCode: sub ? sub.code : '',
        semester: fb.semester,
        branch: fb.branch,
        ratings: fb.ratings,
        averageRating: avgRating,
        positiveComment: fb.positiveComment,
        improvementComment: fb.improvementComment,
        positiveSentiment: analyzeSentiment(fb.positiveComment),
        improvementSentiment: analyzeSentiment(fb.improvementComment),
        submittedAt: fb.submittedAt
        // NOTE: No student identity fields - they were never stored.
      };
    }).sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    res.json({ success: true, data: enriched, total: enriched.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load feedback: ' + err.message });
  }
}

// GET /api/admin/reports/csv - Download CSV report
function downloadCSV(req, res) {
  try {
    const analytics = getDashboardAnalytics();
    const feedbacks = readJSON('feedback.json');
    const faculty = readJSON('faculty.json');
    const subjects = readJSON('subjects.json');

    const lines = [];

    // Header
    lines.push('"FACULTY PERFORMANCE REPORT"');
    lines.push(`"Generated","${new Date().toISOString()}"`);
    lines.push('');

    // Faculty Summary
    lines.push('"Faculty Name","Department","Designation","Total Responses","Average Rating","Performance Category"');
    for (const f of analytics.facultyRankings) {
      lines.push(`"${f.name}","${f.department}","${f.designation}","${f.totalResponses}","${f.overallAverage}","${f.category}"`);
    }

    lines.push('');
    lines.push('"ANONYMOUS FEEDBACK LOG (No Student Identity)"');
    lines.push('"Feedback ID","Faculty","Subject","Semester","Average Rating","Positive Comment","Improvement Comment"');

    for (const fb of feedbacks) {
      const fac = faculty.find(f => f.id === fb.facultyId);
      const sub = subjects.find(s => s.id === fb.subjectId);
      const vals = Object.values(fb.ratings);
      const avg = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
      const posComment = (fb.positiveComment || '').replace(/"/g, '""');
      const impComment = (fb.improvementComment || '').replace(/"/g, '""');
      lines.push(`"${fb.feedbackId}","${fac ? fac.name : ''}","${sub ? sub.name : ''}","${fb.semester}","${avg}","${posComment}","${impComment}"`);
    }

    const csv = lines.join('\r\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="faculty_performance_report_${new Date().toISOString().slice(0,10)}.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate CSV: ' + err.message });
  }
}

// GET /api/admin/reports/json - JSON report data (for client-side PDF generation)
function getReportData(req, res) {
  try {
    const { facultyId } = req.query;
    
    if (facultyId) {
      // Single faculty report
      const perf = calculateFacultyPerformance(facultyId);
      if (!perf) return res.status(404).json({ error: 'Faculty not found.' });
      
      return res.json({
        success: true,
        data: {
          type: 'single',
          faculty: perf.faculty,
          totalResponses: perf.totalResponses,
          overallAverage: perf.overallAverage,
          category: perf.category,
          parameterAverages: perf.parameterAverages,
          subjectStats: perf.subjectStats,
          themes: perf.themes,
          generatedAt: new Date().toISOString()
        }
      });
    }

    // Full system report
    const analytics = getDashboardAnalytics();
    res.json({
      success: true,
      data: {
        type: 'system',
        ...analytics,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate report: ' + err.message });
  }
}

// POST /api/admin/settings - Update system settings
function updateSettings(req, res) {
  try {
    const { minimumResponsesForRanking } = req.body;
    const settings = readJSON('settings.json');

    if (minimumResponsesForRanking !== undefined) {
      const val = parseInt(minimumResponsesForRanking, 10);
      if (isNaN(val) || val < 1 || val > 50) {
        return res.status(400).json({ error: 'Minimum responses must be between 1 and 50.' });
      }
      settings.minimumResponsesForRanking = val;
    }

    writeJSON('settings.json', settings);
    res.json({ success: true, message: 'Settings updated.', data: settings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings: ' + err.message });
  }
}

// GET /api/admin/settings
function getSettings(req, res) {
  try {
    const settings = readJSON('settings.json');
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load settings: ' + err.message });
  }
}

// POST /api/admin/faculty - Add a new Faculty / Sir
function addFaculty(req, res) {
  try {
    const { name, designation, department, email, phone, semesters } = req.body;
    if (!name || !designation || !department) {
      return res.status(400).json({ error: 'Name, designation, and department are required.' });
    }

    const faculty = readJSON('faculty.json');
    const users = readJSON('users.json');

    // Generate unique ID matching FAC001 - FAC050 sequence
    let maxIdNum = 50;
    for (const f of faculty) {
      const match = (f.id || '').match(/^(?:fac-?|FAC)(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxIdNum) maxIdNum = num;
      }
    }
    const nextNum = maxIdNum + 1;
    const newId = `FAC${String(nextNum).padStart(3, '0')}`;

    const formattedSemesters = Array.isArray(semesters) && semesters.length > 0
      ? semesters.map(s => parseInt(s, 10)).filter(s => !isNaN(s) && s > 0)
      : [1, 2];

    const cleanEmail = email && email.trim()
      ? email.trim().toLowerCase()
      : `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@apexuniversity.edu.in`;

    const newFaculty = {
      id: newId,
      name: name.trim(),
      designation: designation.trim(),
      department: department.trim(),
      email: cleanEmail,
      phone: phone ? phone.trim() : '+91 98000 00000',
      subjects: [],
      semesters: formattedSemesters,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };

    faculty.push(newFaculty);
    writeJSON('faculty.json', faculty);

    // Auto-create faculty user account
    const username = `faculty${nextNum}`;
    const userExists = users.some(u => u.username === username);
    if (!userExists) {
      users.push({
        id: `usr-${newId.toLowerCase()}`,
        username,
        password: 'faculty123',
        name: name.trim(),
        role: 'faculty',
        department: department.trim(),
        email: cleanEmail,
        employeeId: `EMP-APX-${1000 + nextNum}`,
        facultyId: newId
      });
      writeJSON('users.json', users);
    }

    res.status(201).json({
      success: true,
      message: `Faculty member "${newFaculty.name}" added successfully.`,
      data: newFaculty,
      credentials: { username, defaultPassword: 'faculty123' }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add faculty: ' + err.message });
  }
}

// DELETE /api/admin/faculty/:id - Remove a faculty member
function deleteFaculty(req, res) {
  try {
    const { id } = req.params;
    let faculty = readJSON('faculty.json');
    const existing = faculty.find(f => f.id === id);
    if (!existing) {
      return res.status(404).json({ error: 'Faculty member not found.' });
    }

    faculty = faculty.filter(f => f.id !== id);
    writeJSON('faculty.json', faculty);

    // Clean up corresponding user
    let users = readJSON('users.json');
    users = users.filter(u => u.id !== `usr-${id}` && u.username !== `faculty_${id.replace('fac-', '')}`);
    writeJSON('users.json', users);

    res.json({ success: true, message: `Faculty "${existing.name}" removed.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete faculty: ' + err.message });
  }
}

// POST /api/admin/programs - Add a new degree program
function addProgram(req, res) {
  try {
    const { name, degree, department, durationYears, totalSemesters, code } = req.body;
    if (!name || !department) {
      return res.status(400).json({ error: 'Program name and department are required.' });
    }

    const programs = readJSON('programs.json');

    // Clean name: ensure no SOCCA/SOCET/Silver Oak
    let cleanName = name.replace(/^(SOCCA|SOCET|ASOIT|SOIS|SOIM|Silver Oak|SOU)\s*[-:]?\s*/i, '').trim();

    if (programs.some(p => p.name.toLowerCase() === cleanName.toLowerCase())) {
      return res.status(400).json({ error: 'A program with this name already exists.' });
    }

    const programCode = code && code.trim()
      ? code.trim().toUpperCase()
      : cleanName.split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 8);

    const progId = `prog-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`.slice(0, 32);

    const newProgram = {
      id: progId,
      code: programCode,
      name: cleanName,
      degree: degree && degree.trim() ? degree.trim() : (cleanName.startsWith('M.') ? "Master's" : "Bachelor's"),
      department: department.trim(),
      durationYears: parseInt(durationYears, 10) || 4,
      totalSemesters: parseInt(totalSemesters, 10) || 8
    };

    programs.push(newProgram);
    writeJSON('programs.json', programs);

    res.status(201).json({
      success: true,
      message: `Program "${cleanName}" added successfully.`,
      data: newProgram
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add program: ' + err.message });
  }
}

// DELETE /api/admin/programs/:id - Remove a program
function deleteProgram(req, res) {
  try {
    const { id } = req.params;
    let programs = readJSON('programs.json');
    const existing = programs.find(p => p.id === id || p.code === id);
    if (!existing) {
      return res.status(404).json({ error: 'Program not found.' });
    }

    programs = programs.filter(p => p.id !== existing.id);
    writeJSON('programs.json', programs);

    res.json({ success: true, message: `Program "${existing.name}" removed.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete program: ' + err.message });
  }
}

// POST /api/admin/subjects - Add a new subject linked to program, semester, and faculty
function addSubject(req, res) {
  try {
    const { code, name, program, semester, credits, facultyId } = req.body;
    if (!name || !program || !semester || !facultyId) {
      return res.status(400).json({ error: 'Name, program, semester, and faculty are required.' });
    }

    const subjects = readJSON('subjects.json');
    const facultyList = readJSON('faculty.json');

    const semNum = parseInt(semester, 10);
    if (isNaN(semNum) || semNum < 1) {
      return res.status(400).json({ error: 'Valid semester number is required.' });
    }

    const assignedSir = facultyList.find(f => f.id === facultyId);
    if (!assignedSir) {
      return res.status(404).json({ error: 'Assigned faculty / Sir not found.' });
    }

    const subCode = code && code.trim() ? code.trim().toUpperCase() : `SUB${Math.floor(100 + Math.random() * 900)}`;
    const subId = `sub-${Math.random().toString(36).substring(2, 9)}`;

    const newSubject = {
      id: subId,
      code: subCode,
      name: name.trim(),
      program: program.trim(),
      semester: semNum,
      credits: parseInt(credits, 10) || 4,
      facultyId: assignedSir.id,
      facultyName: assignedSir.name,
      facultyDesignation: assignedSir.designation
    };

    subjects.push(newSubject);
    writeJSON('subjects.json', subjects);

    // Update faculty's subjects and semesters list
    if (!assignedSir.subjects) assignedSir.subjects = [];
    if (!assignedSir.semesters) assignedSir.semesters = [];

    if (!assignedSir.subjects.includes(subId)) {
      assignedSir.subjects.push(subId);
    }
    if (!assignedSir.semesters.includes(semNum)) {
      assignedSir.semesters.push(semNum);
      assignedSir.semesters.sort((a, b) => a - b);
    }
    writeJSON('faculty.json', facultyList);

    res.status(201).json({
      success: true,
      message: `Subject "${newSubject.name}" assigned to ${assignedSir.name} successfully.`,
      data: newSubject
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add subject: ' + err.message });
  }
}

// DELETE /api/admin/subjects/:id - Remove a subject
function deleteSubject(req, res) {
  try {
    const { id } = req.params;
    let subjects = readJSON('subjects.json');
    const existing = subjects.find(s => s.id === id || s.code === id);
    if (!existing) {
      return res.status(404).json({ error: 'Subject not found.' });
    }

    subjects = subjects.filter(s => s.id !== existing.id);
    writeJSON('subjects.json', subjects);

    // Clean up faculty references
    const facultyList = readJSON('faculty.json');
    for (const fac of facultyList) {
      if (fac.subjects && fac.subjects.includes(existing.id)) {
        fac.subjects = fac.subjects.filter(sid => sid !== existing.id);
      }
    }
    writeJSON('faculty.json', facultyList);

    res.json({ success: true, message: `Subject "${existing.name}" removed.` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete subject: ' + err.message });
  }
}

// GET /api/admin/catalog - Full catalog summary
function getCatalog(req, res) {
  try {
    const programs = readJSON('programs.json');
    const subjects = readJSON('subjects.json');
    const faculty = readJSON('faculty.json');

    res.json({
      success: true,
      data: {
        programs,
        subjects,
        faculty: faculty.map(f => ({
          id: f.id,
          name: f.name,
          designation: f.designation,
          department: f.department,
          email: f.email,
          phone: f.phone,
          semesters: f.semesters,
          subjectCount: f.subjects ? f.subjects.length : 0
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load catalog: ' + err.message });
  }
}

module.exports = {
  getDashboard,
  getAllFaculty,
  getFacultyDetail,
  getAnalytics,
  getAnonymousFeedback,
  downloadCSV,
  getReportData,
  updateSettings,
  getSettings,
  addFaculty,
  deleteFaculty,
  addProgram,
  deleteProgram,
  addSubject,
  deleteSubject,
  getCatalog
};
