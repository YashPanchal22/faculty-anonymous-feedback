// Seed anonymous feedback for faculty with < 5 responses
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATA_DIR = path.join(__dirname, '..', 'data');

const feedback = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'feedback.json'), 'utf8'));
const faculty = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'faculty.json'), 'utf8'));
const subjects = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'subjects.json'), 'utf8'));

const positiveTemplates = [
  "Exceptional teaching pedagogy and in-depth conceptual breakdown.",
  "Very approachable during doubt solving hours and project guidance.",
  "Provides clear industry examples and real-world implementation techniques.",
  "Encourages student participation and active problem solving in class.",
  "Course notes and lecture slides are well-structured and comprehensive.",
  "Punctual, organized, and maintains high academic rigor.",
  "Inspiring lectures that connect theory with practical laboratory experiments."
];

const improvementTemplates = [
  "Could share more practice problem sets before mid-semester examinations.",
  "Pacing is slightly fast during derivations; extra recap would help.",
  "Would appreciate more hands-on demonstration sessions in laboratory.",
  "Could upload lecture reference materials earlier on LMS.",
  "Recommend allocating more time for group discussions and mini-projects.",
  "A few more live case studies would be very beneficial."
];

let addedCount = 0;

faculty.forEach(f => {
  const currentFb = feedback.filter(fb => fb.facultyId === f.id);
  const needed = Math.max(0, 6 - currentFb.length);

  if (needed > 0 && f.subjects && f.subjects.length > 0) {
    for (let i = 0; i < needed; i++) {
      const subId = f.subjects[i % f.subjects.length];
      const sub = subjects.find(s => s.id === subId) || { semester: 3, program: f.branch || 'btech_ce' };

      // Generate realistic scores between 3 and 5
      const baseScore = 3 + Math.floor(Math.random() * 2); // 3 or 4
      const r = (offset = 0) => Math.min(5, Math.max(2, baseScore + (Math.random() > 0.4 ? 1 : 0) + offset));

      const month = String(1 + Math.floor(Math.random() * 8)).padStart(2, '0');
      const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, '0');
      const hour = String(9 + Math.floor(Math.random() * 8)).padStart(2, '0');
      const minute = String(10 + Math.floor(Math.random() * 45)).padStart(2, '0');

      feedback.push({
        feedbackId: uuidv4(),
        facultyId: f.id,
        subjectId: subId,
        semester: sub.semester,
        branch: sub.program,
        ratings: {
          subjectKnowledge: r(1),
          clarity: r(),
          communication: r(),
          engagement: r(),
          punctuality: r(1),
          doubtResolution: r(),
          practicalExamples: r(),
          overallSatisfaction: r()
        },
        positiveComment: positiveTemplates[Math.floor(Math.random() * positiveTemplates.length)],
        improvementComment: improvementTemplates[Math.floor(Math.random() * improvementTemplates.length)],
        submittedAt: `2026-${month}-${day}T${hour}:${minute}:00.000Z`
      });
      addedCount++;
    }
  }
});

fs.writeFileSync(path.join(DATA_DIR, 'feedback.json'), JSON.stringify(feedback, null, 2), 'utf8');
console.log(`Added ${addedCount} anonymous feedback entries. Total feedback records now: ${feedback.length}`);
