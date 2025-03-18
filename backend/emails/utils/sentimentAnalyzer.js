/**
 * Email sentiment analysis utilities
 * This provides both simplified rule-based analysis and
 * integration points for more advanced ML-based analysis
 */

// Lists of words indicating different sentiments
const POSITIVE_WORDS = [
  'thanks', 'thank you', 'grateful', 'appreciate', 'happy', 'pleased',
  'great', 'good', 'excellent', 'wonderful', 'amazing', 'awesome',
  'delighted', 'excited', 'love', 'fantastic', 'perfect', 'thrilled',
  'satisfied', 'impressed', 'helpful', 'congratulations', 'kudos'
];

const NEGATIVE_WORDS = [
  'issue', 'problem', 'error', 'mistake', 'wrong', 'bad', 'unhappy',
  'disappointed', 'frustrating', 'frustration', 'complaint', 'fail',
  'failed', 'terrible', 'awful', 'horrible', 'annoying', 'annoyed',
  'concerned', 'concern', 'broken', 'bug', 'difficult', 'trouble',
  'unfortunately', 'regret', 'sorry', 'apology', 'apologize'
];

const URGENT_INDICATORS = [
  'urgent', 'asap', 'emergency', 'immediately', 'critical', 'important',
  'deadline', 'quickly', 'hurry', 'rush', 'now', 'priority', 'attention'
];

/**
 * Simple rule-based sentiment analysis for emails
 * @param {string} text - Email text to analyze
 * @returns {string} - Sentiment classification: 'positive', 'negative', or 'neutral'
 */
export const analyzeEmailSentiment = (text) => {
  if (!text) return 'neutral';
  
  const lowerText = text.toLowerCase();
  
  // Count sentiment indicators in text
  const positiveScore = POSITIVE_WORDS.reduce((count, word) => {
    return count + (lowerText.includes(word) ? 1 : 0);
  }, 0);
  
  const negativeScore = NEGATIVE_WORDS.reduce((count, word) => {
    return count + (lowerText.includes(word) ? 1 : 0);
  }, 0);
  
  // Determine sentiment based on scores
  if (positiveScore > negativeScore) return 'positive';
  if (negativeScore > positiveScore) return 'negative';
  return 'neutral';
};

/**
 * Determines if email contains urgent indicators
 * @param {string} subject - Email subject
 * @param {string} body - Email body
 * @returns {boolean} - True if email appears urgent
 */
export const isUrgent = (subject, body) => {
  const combinedText = (subject + ' ' + body).toLowerCase();
  return URGENT_INDICATORS.some(word => combinedText.includes(word));
};

/**
 * Calculate a priority score for an email based on content
 * @param {Object} email - Email object with subject, body, and other metadata
 * @returns {number} - Priority score (1-5, where 1 is highest priority)
 */
export const calculatePriority = (email) => {
  let score = 3; // Default: medium priority
  const sentiment = analyzeEmailSentiment(email.body?.text || '');
  
  // Adjust based on sentiment
  if (sentiment === 'negative') score -= 1;
  if (sentiment === 'positive') score += 0.5;
  
  // Urgent markers lower score (higher priority)
  if (isUrgent(email.subject, email.body?.text || '')) score -= 1;
  
  // Adjust based on from email domain
  if (email.from?.email) {
    const domain = email.from.email.split('@')[1]?.toLowerCase();
    // Internal or high-value domains get higher priority
    if (domain === 'company.com' || domain === 'important-client.com') {
      score -= 1;
    }
  }
  
  // Clamp between 1 and 5
  return Math.max(1, Math.min(5, Math.round(score)));
};

/**
 * Deep sentiment analysis using ML (integration point)
 * This would connect to an external sentiment analysis API
 * @param {string} text - Email text to analyze
 * @returns {Promise<Object>} - Detailed sentiment results
 */
export const deepSentimentAnalysis = async (text) => {
  // This would integrate with a more sophisticated sentiment analysis service
  // For now, return simpler analysis
  const sentiment = analyzeEmailSentiment(text);
  
  return {
    sentiment,
    confidence: 0.7, // Placeholder confidence score
    details: {
      positive: sentiment === 'positive' ? 0.7 : 0.2,
      negative: sentiment === 'negative' ? 0.7 : 0.2,
      neutral: sentiment === 'neutral' ? 0.7 : 0.1
    }
  };
};

export default {
  analyzeEmailSentiment,
  isUrgent,
  calculatePriority,
  deepSentimentAnalysis
};