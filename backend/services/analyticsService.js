// Analytics Service - Aggregation, Rankings, and Performance Calculations
// All calculations work on anonymized feedback data only.

const fs = require('fs');
const path = require('path');
const { analyzeSentiment, extractCommonThemes } = require('./sentimentService');

const DATA_DIR = path.join(__dirname, '..', 'data');

function readJSON(file) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
}

const RATING_PARAMS = [
  'subjectKnowledge', 'clarity', 'communication', 'engagement',
  'punctuality', 'doubtResolution', 'practicalExamples', 'overallSatisfaction'
];

const PARAM_LABELS = {
  subjectKnowledge: 'Subject Knowledge',
  clarity: 'Explanation / Clarity',
  communication: 'Communication',
  engagement: 'Student Engagement',
  punctuality: 'Punctuality',
  doubtResolution: 'Doubt Resolution',
  practicalExamples: 'Practical / Real-world Examples',
  overallSatisfaction: 'Overall Satisfaction'
};

function getPerformanceCategory(avgRating, feedbackCount, minThreshold) {
  if (feedbackCount < minThreshold) return 'Insufficient Responses';
  if (avgRating >= 4.2) return 'Top Rated Faculty';
  if (avgRating >= 3.8) return 'Strong Performance';
  if (avgRating >= 3.5) return 'Good Performance';
  return 'Needs Improvement';
}

function getCategoryColor(category) {
  switch (category) {
    case 'Top Rated Faculty': return '#059669';
    case 'Strong Performance': return '#2563eb';
    case 'Good Performance': return '#7c3aed';
    case 'Needs Improvement': return '#d97706';
    case 'Insufficient Responses': return '#64748b';
    default: return '#64748b';
  }
}

/**
 * Calculate aggregated performance stats for a single faculty member.
 * Returns ONLY aggregated data - no individual student responses.
 */
function calculateFacultyPerformance(facultyId) {
  const feedbacks = readJSON('feedback.json');
  const settings = readJSON('settings.json');
  const subjects = readJSON('subjects.json');
  const faculty = readJSON('faculty.json');

  const fac = faculty.find(f => f.id === facultyId);
  if (!fac) return null;

  const facFeedbacks = feedbacks.filter(fb => fb.facultyId === facultyId);
  const totalResponses = facFeedbacks.length;

  // Parameter averages
  const paramAverages = {};
  let overallSum = 0;
  let overallCount = 0;

  for (const param of RATING_PARAMS) {
    const values = facFeedbacks.map(fb => fb.ratings[param]).filter(v => v != null);
    const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    paramAverages[param] = parseFloat(avg.toFixed(2));
    overallSum += avg;
    overallCount++;
  }

  const overallAverage = overallCount > 0 ? parseFloat((overallSum / overallCount).toFixed(2)) : 0;
  const category = getPerformanceCategory(overallAverage, totalResponses, settings.minimumResponsesForRanking);

  // Subject-wise breakdown
  const subjectBreakdown = {};
  for (const fb of facFeedbacks) {
    if (!subjectBreakdown[fb.subjectId]) {
      const sub = subjects.find(s => s.id === fb.subjectId);
      subjectBreakdown[fb.subjectId] = {
        subjectId: fb.subjectId,
        subjectName: sub ? sub.name : 'Unknown',
        subjectCode: sub ? sub.code : '',
        count: 0,
        totalRating: 0
      };
    }
    const allRatings = Object.values(fb.ratings);
    const avgRating = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;
    subjectBreakdown[fb.subjectId].count++;
    subjectBreakdown[fb.subjectId].totalRating += avgRating;
  }

  const subjectStats = Object.values(subjectBreakdown).map(s => ({
    ...s,
    averageRating: parseFloat((s.totalRating / s.count).toFixed(2))
  }));

  // Monthly trend
  const monthlyTrend = {};
  for (const fb of facFeedbacks) {
    const month = fb.submittedAt ? fb.submittedAt.substring(0, 7) : 'unknown';
    if (!monthlyTrend[month]) {
      monthlyTrend[month] = { month, count: 0, totalRating: 0 };
    }
    const allRatings = Object.values(fb.ratings);
    const avgRating = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;
    monthlyTrend[month].count++;
    monthlyTrend[month].totalRating += avgRating;
  }

  const trendData = Object.values(monthlyTrend)
    .map(m => ({ ...m, averageRating: parseFloat((m.totalRating / m.count).toFixed(2)) }))
    .sort((a, b) => a.month.localeCompare(b.month));

  // Collect anonymous comments for sentiment
  const allComments = facFeedbacks
    .map(fb => [fb.positiveComment, fb.improvementComment])
    .flat()
    .filter(Boolean);

  const commentSentiments = allComments.map(c => ({
    text: c,
    sentiment: analyzeSentiment(c)
  }));

  const themes = extractCommonThemes(allComments);

  return {
    faculty: {
      id: fac.id,
      name: fac.name,
      designation: fac.designation,
      department: fac.department,
      subjects: fac.subjects.map(sid => {
        const s = subjects.find(sub => sub.id === sid);
        return s ? { id: s.id, code: s.code, name: s.name, semester: s.semester } : null;
      }).filter(Boolean)
    },
    totalResponses,
    overallAverage,
    category,
    categoryColor: getCategoryColor(category),
    parameterAverages: RATING_PARAMS.map(p => ({
      key: p,
      label: PARAM_LABELS[p],
      average: paramAverages[p]
    })),
    subjectStats,
    trendData,
    themes,
    // Only for admin use - never exposed to faculty
    _commentSentiments: commentSentiments
  };
}

/**
 * Get system-wide dashboard analytics (admin only).
 */
function getDashboardAnalytics() {
  const feedbacks = readJSON('feedback.json');
  const faculty = readJSON('faculty.json');
  const subjects = readJSON('subjects.json');
  const settings = readJSON('settings.json');

  const totalFeedback = feedbacks.length;
  const totalFaculty = faculty.length;
  const totalSubjects = subjects.length;

  // Overall system average
  let systemRatingSum = 0;
  let systemRatingCount = 0;
  for (const fb of feedbacks) {
    const vals = Object.values(fb.ratings);
    systemRatingSum += vals.reduce((a, b) => a + b, 0) / vals.length;
    systemRatingCount++;
  }
  const systemAverage = systemRatingCount > 0 ? parseFloat((systemRatingSum / systemRatingCount).toFixed(2)) : 0;

  // Faculty rankings
  const facultyStats = faculty.map(fac => {
    const perf = calculateFacultyPerformance(fac.id);
    return {
      id: fac.id,
      name: fac.name,
      designation: fac.designation,
      department: fac.department,
      totalResponses: perf.totalResponses,
      overallAverage: perf.overallAverage,
      category: perf.category,
      categoryColor: perf.categoryColor
    };
  });

  facultyStats.sort((a, b) => b.overallAverage - a.overallAverage);

  const topRatedCount = facultyStats.filter(f => f.category === 'Top Rated Faculty').length;
  const needsImprovementCount = facultyStats.filter(f => f.category === 'Needs Improvement').length;

  // Department averages
  const deptMap = {};
  for (const fac of facultyStats) {
    if (!deptMap[fac.department]) {
      deptMap[fac.department] = { department: fac.department, totalRating: 0, count: 0 };
    }
    if (fac.totalResponses >= settings.minimumResponsesForRanking) {
      deptMap[fac.department].totalRating += fac.overallAverage;
      deptMap[fac.department].count++;
    }
  }
  const departmentAverages = Object.values(deptMap).map(d => ({
    department: d.department,
    average: d.count > 0 ? parseFloat((d.totalRating / d.count).toFixed(2)) : 0
  }));

  // Parameter system averages
  const paramSysAvg = {};
  for (const p of RATING_PARAMS) {
    const values = feedbacks.map(fb => fb.ratings[p]).filter(v => v != null);
    paramSysAvg[p] = {
      key: p,
      label: PARAM_LABELS[p],
      average: values.length > 0 ? parseFloat((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)) : 0
    };
  }

  // Rating distribution
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const fb of feedbacks) {
    const vals = Object.values(fb.ratings);
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    const rounded = Math.min(5, Math.max(1, Math.round(avg)));
    distribution[rounded]++;
  }

  // Semester-wise
  const semesterMap = {};
  for (const fb of feedbacks) {
    const sem = `Semester ${fb.semester}`;
    if (!semesterMap[sem]) semesterMap[sem] = { semester: sem, totalRating: 0, count: 0 };
    const vals = Object.values(fb.ratings);
    semesterMap[sem].totalRating += vals.reduce((a, b) => a + b, 0) / vals.length;
    semesterMap[sem].count++;
  }
  const semesterAverages = Object.values(semesterMap).map(s => ({
    semester: s.semester,
    average: parseFloat((s.totalRating / s.count).toFixed(2)),
    count: s.count
  })).sort((a, b) => a.semester.localeCompare(b.semester));

  // Monthly trend
  const monthMap = {};
  for (const fb of feedbacks) {
    const month = fb.submittedAt ? fb.submittedAt.substring(0, 7) : 'unknown';
    if (!monthMap[month]) monthMap[month] = { month, count: 0, totalRating: 0 };
    const vals = Object.values(fb.ratings);
    monthMap[month].totalRating += vals.reduce((a, b) => a + b, 0) / vals.length;
    monthMap[month].count++;
  }
  const monthlyTrend = Object.values(monthMap)
    .map(m => ({ month: m.month, count: m.count, average: parseFloat((m.totalRating / m.count).toFixed(2)) }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return {
    kpis: {
      totalFeedback,
      totalFaculty,
      totalSubjects,
      totalDepartments: new Set(faculty.map(f => f.department)).size,
      systemAverage,
      topRatedCount,
      needsImprovementCount
    },
    facultyRankings: facultyStats,
    departmentAverages,
    parameterAverages: Object.values(paramSysAvg),
    ratingDistribution: distribution,
    semesterAverages,
    monthlyTrend,
    minimumThreshold: settings.minimumResponsesForRanking
  };
}

module.exports = {
  calculateFacultyPerformance,
  getDashboardAnalytics,
  getPerformanceCategory,
  RATING_PARAMS,
  PARAM_LABELS
};
