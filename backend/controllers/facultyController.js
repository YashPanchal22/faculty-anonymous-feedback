// Faculty Controller - Faculty can ONLY see their own aggregated performance.
// CRITICAL: No individual student responses, names, IDs, or identifiable data exposed.

const { calculateFacultyPerformance } = require('../services/analyticsService');

// GET /api/faculty/me - Faculty profile and assigned subjects
function getMyProfile(req, res) {
  const facultyId = req.user.facultyId;
  if (!facultyId) {
    return res.status(400).json({ error: 'Faculty ID not linked to this account.' });
  }

  const perf = calculateFacultyPerformance(facultyId);
  if (!perf) {
    return res.status(404).json({ error: 'Faculty record not found.' });
  }

  res.json({
    success: true,
    data: {
      profile: perf.faculty,
      totalResponses: perf.totalResponses,
      overallAverage: perf.overallAverage,
      category: perf.category,
      categoryColor: perf.categoryColor
    }
  });
}

// GET /api/faculty/me/performance - Aggregated performance analytics
// Returns ONLY aggregated stats. NO individual student feedback records.
function getMyPerformance(req, res) {
  const facultyId = req.user.facultyId;
  if (!facultyId) {
    return res.status(400).json({ error: 'Faculty ID not linked to this account.' });
  }

  const perf = calculateFacultyPerformance(facultyId);
  if (!perf) {
    return res.status(404).json({ error: 'Faculty record not found.' });
  }

  // PRIVACY: Strip individual comment sentiments - faculty sees only theme summaries
  res.json({
    success: true,
    data: {
      profile: perf.faculty,
      totalResponses: perf.totalResponses,
      overallAverage: perf.overallAverage,
      category: perf.category,
      categoryColor: perf.categoryColor,
      parameterAverages: perf.parameterAverages,
      subjectStats: perf.subjectStats,
      trendData: perf.trendData,
      // Faculty gets aggregated theme summaries, NOT raw comments
      commonStrengths: perf.themes.strengths,
      commonImprovements: perf.themes.improvements
      // NOTE: _commentSentiments is intentionally NOT included here.
      // Raw anonymous comments are restricted to High Authority only.
    }
  });
}

module.exports = { getMyProfile, getMyPerformance };
