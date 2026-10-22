// Sentiment Analysis Service (Rule-based / Local)
// Classifies anonymous comments as Positive, Neutral, or Needs Attention.
// No external API calls - all processing is local and privacy-preserving.

const POSITIVE_WORDS = [
  'excellent', 'great', 'best', 'amazing', 'outstanding', 'clear', 'helpful',
  'knowledgeable', 'passionate', 'engaging', 'interesting', 'supportive',
  'patient', 'well', 'good', 'enjoy', 'appreciate', 'effective', 'structured',
  'organized', 'encourage', 'interactive', 'approachable', 'easy', 'understand',
  'balance', 'practical', 'creative', 'innovative', 'inspiring', 'motivated',
  'thorough', 'detailed', 'responsive', 'fantastic', 'wonderful', 'superb'
];

const NEGATIVE_WORDS = [
  'poor', 'bad', 'slow', 'fast', 'rushed', 'confusing', 'unclear', 'boring',
  'difficult', 'hard', 'lacking', 'improve', 'improvement', 'better', 'more',
  'less', 'could', 'should', 'missing', 'insufficient', 'weak', 'monotone',
  'late', 'unprepared', 'disorganized', 'text-heavy', 'quickly', 'challenging',
  'problem', 'issue', 'concern', 'frustrating', 'complicated'
];

function analyzeSentiment(text) {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return { label: 'Neutral', score: 0 };
  }

  const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;

  for (const word of words) {
    if (POSITIVE_WORDS.includes(word)) positiveCount++;
    if (NEGATIVE_WORDS.includes(word)) negativeCount++;
  }

  const score = positiveCount - negativeCount;

  if (score > 1) return { label: 'Positive', score };
  if (score < -1) return { label: 'Needs Attention', score };
  if (positiveCount > negativeCount) return { label: 'Positive', score };
  if (negativeCount > positiveCount) return { label: 'Needs Attention', score };
  return { label: 'Neutral', score: 0 };
}

function extractCommonThemes(comments) {
  const strengths = [];
  const improvements = [];

  const strengthKeywords = {
    'Clear explanations': ['clear', 'clarity', 'easy to understand', 'well explained'],
    'Strong subject knowledge': ['knowledgeable', 'knowledge', 'expertise', 'expert'],
    'Good communication': ['communication', 'articulate', 'engaging'],
    'Practical approach': ['practical', 'real-world', 'examples', 'hands-on'],
    'Punctual and organized': ['punctual', 'organized', 'structured', 'prepared'],
    'Supportive and approachable': ['supportive', 'approachable', 'helpful', 'patient'],
    'Interactive teaching': ['interactive', 'engaging', 'discussion', 'participation']
  };

  const improvementKeywords = {
    'Pace of delivery': ['fast', 'quickly', 'rushed', 'pace', 'slow'],
    'More practical examples': ['practical', 'examples', 'real-world', 'case studies'],
    'Doubt resolution time': ['doubt', 'question', 'resolution', 'time'],
    'Interactive sessions': ['interactive', 'engage', 'participation'],
    'Better visual aids': ['visual', 'diagram', 'slides', 'text-heavy'],
    'More coding exercises': ['coding', 'exercise', 'practice', 'assignment']
  };

  const allText = comments.map(c => (c || '').toLowerCase()).join(' ');

  for (const [theme, keywords] of Object.entries(strengthKeywords)) {
    if (keywords.some(k => allText.includes(k))) {
      strengths.push(theme);
    }
  }

  for (const [theme, keywords] of Object.entries(improvementKeywords)) {
    if (keywords.some(k => allText.includes(k))) {
      improvements.push(theme);
    }
  }

  return { strengths: strengths.slice(0, 4), improvements: improvements.slice(0, 4) };
}

module.exports = { analyzeSentiment, extractCommonThemes };
