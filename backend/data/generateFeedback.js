// Seed script to generate initial feedback data
// Run: node generateFeedback.js
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const facultyIds = ['FAC001','FAC002','FAC003','FAC004','FAC005','FAC006','FAC007','FAC008','FAC009','FAC010'];

const facultySubjects = {
  FAC001: [{sub:'SUB009',sem:3},{sub:'SUB012',sem:3}],
  FAC002: [{sub:'SUB005',sem:2},{sub:'SUB013',sem:4}],
  FAC003: [{sub:'SUB001',sem:1},{sub:'SUB006',sem:2}],
  FAC004: [{sub:'SUB003',sem:1},{sub:'SUB011',sem:3}],
  FAC005: [{sub:'SUB002',sem:1},{sub:'SUB008',sem:2}],
  FAC006: [{sub:'SUB004',sem:1},{sub:'SUB010',sem:3}],
  FAC007: [{sub:'SUB017',sem:5},{sub:'SUB019',sem:5}],
  FAC008: [{sub:'SUB007',sem:2},{sub:'SUB014',sem:4}],
  FAC009: [{sub:'SUB015',sem:4},{sub:'SUB018',sem:5}],
  FAC010: [{sub:'SUB016',sem:4},{sub:'SUB020',sem:5},{sub:'SUB021',sem:6},{sub:'SUB022',sem:6}]
};

const positiveComments = [
  "Excellent teaching methodology. Very clear explanations.",
  "The faculty made complex topics easy to understand.",
  "Great use of real-world examples in lectures.",
  "Very approachable and always willing to help with doubts.",
  "Highly knowledgeable and passionate about the subject.",
  "The practical sessions were very well organized.",
  "Explained concepts with patience and clarity.",
  "One of the best faculty members in the department.",
  "Engaging lectures that kept everyone interested.",
  "Good balance between theory and practical applications.",
  "Always punctual and well-prepared for lectures.",
  "Made the subject genuinely interesting and enjoyable.",
  "Very supportive during lab sessions and assignments.",
  "Clear communication and structured lecture delivery.",
  "Encouraged critical thinking and problem-solving."
];

const constructiveComments = [
  "More practical examples would be helpful.",
  "Could improve pace of lecture delivery.",
  "Sometimes topics are covered too quickly.",
  "More time could be given for doubt resolution.",
  "Would benefit from more interactive sessions.",
  "Assignments could be more challenging.",
  "More real-world case studies would enhance learning.",
  "Could use more visual aids and diagrams.",
  "Sometimes the lecture slides are text-heavy.",
  "Would appreciate more coding exercises in class."
];

const neutralComments = [
  "Decent teaching overall.",
  "Average performance, meets expectations.",
  "The course was covered as per syllabus.",
  "Standard lecture delivery.",
  "Satisfactory teaching methodology."
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRatings(profile) {
  // profile: 'high' (4-5), 'medium' (3-4), 'low' (2-3), 'mixed'
  const ranges = {
    high: [4, 5],
    medium: [3, 5],
    low: [2, 4],
    mixed: [1, 5]
  };
  const [min, max] = ranges[profile] || [3, 5];
  return {
    subjectKnowledge: randomInt(min, max),
    clarity: randomInt(min, max),
    communication: randomInt(min, max),
    engagement: randomInt(min, max),
    punctuality: randomInt(min, max),
    doubtResolution: randomInt(min, max),
    practicalExamples: randomInt(min, max),
    overallSatisfaction: randomInt(min, max)
  };
}

// Faculty performance profiles for realistic variety
const facultyProfiles = {
  FAC001: 'high',    // Dr. Arvind Sharma - top rated
  FAC002: 'high',    // Prof. Neha Patel - strong
  FAC003: 'medium',  // Dr. Rajesh Kumar - good
  FAC004: 'medium',  // Prof. Priya Desai - good
  FAC005: 'high',    // Dr. Suresh Mehta - strong
  FAC006: 'medium',  // Prof. Anita Joshi - average
  FAC007: 'high',    // Dr. Vikram Singh - top rated
  FAC008: 'low',     // Prof. Kavita Rao - needs improvement
  FAC009: 'medium',  // Dr. Amit Trivedi - good
  FAC010: 'low'      // Prof. Deepa Shah - needs improvement
};

const feedbacks = [];
const months = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];

for (const facId of facultyIds) {
  const profile = facultyProfiles[facId];
  const subjectPairs = facultySubjects[facId];
  // Generate 5-8 feedbacks per faculty
  const count = randomInt(5, 8);
  
  for (let i = 0; i < count; i++) {
    const pair = pickRandom(subjectPairs);
    const month = pickRandom(months);
    const day = randomInt(1, 28);
    const hour = randomInt(8, 20);

    let comment = '';
    if (profile === 'high') {
      comment = Math.random() > 0.3 ? pickRandom(positiveComments) : pickRandom(neutralComments);
    } else if (profile === 'low') {
      comment = Math.random() > 0.4 ? pickRandom(constructiveComments) : pickRandom(neutralComments);
    } else {
      const r = Math.random();
      if (r > 0.5) comment = pickRandom(positiveComments);
      else if (r > 0.2) comment = pickRandom(neutralComments);
      else comment = pickRandom(constructiveComments);
    }

    feedbacks.push({
      feedbackId: uuidv4(),
      facultyId: facId,
      subjectId: pair.sub,
      semester: pair.sem,
      branch: 'bsc_ds',
      ratings: generateRatings(profile),
      positiveComment: profile === 'high' || Math.random() > 0.5 ? pickRandom(positiveComments) : '',
      improvementComment: profile === 'low' || Math.random() > 0.6 ? pickRandom(constructiveComments) : '',
      submittedAt: `${month}-${String(day).padStart(2,'0')}T${String(hour).padStart(2,'0')}:${String(randomInt(0,59)).padStart(2,'0')}:00.000Z`
    });
  }
}

// Sort by date
feedbacks.sort((a, b) => new Date(a.submittedAt) - new Date(b.submittedAt));

fs.writeFileSync(path.join(__dirname, 'feedback.json'), JSON.stringify(feedbacks, null, 2));
console.log(`Generated ${feedbacks.length} anonymous feedback records.`);
