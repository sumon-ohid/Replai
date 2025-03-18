/**
 * Email categorization utilities
 * Provides functions to categorize emails based on content and metadata
 */

// Email category definitions
const CATEGORY_DEFINITIONS = {
  primary: {
    description: 'Important personal and business emails',
    priority: 'high'
  },
  social: {
    description: 'Social media notifications and updates',
    priority: 'medium'
  },
  promotions: {
    description: 'Marketing emails and offers',
    priority: 'low'
  },
  updates: {
    description: 'Notifications, receipts, and automated updates',
    priority: 'medium'
  },
  forums: {
    description: 'Mailing lists and discussion groups',
    priority: 'medium'
  },
  important: {
    description: 'Emails flagged as important or urgent',
    priority: 'highest'
  },
  unclassified: {
    description: 'Emails without a specific category',
    priority: 'medium'
  }
};

// Domain patterns for different categories
const DOMAIN_PATTERNS = {
  social: [
    'linkedin.com', 'twitter.com', 'facebook.com', 'instagram.com',
    'tiktok.com', 'reddit.com', 'snapchat.com', 'pinterest.com',
    'quora.com', 'medium.com'
  ],
  promotions: [
    'marketing', 'newsletter', 'offer', 'promo', 'sale', 'discount',
    'deal', 'coupon', 'shop', 'store', 'special'
  ],
  updates: [
    'noreply', 'no-reply', 'donotreply', 'automated', 'system',
    'notification', 'alert', 'update', 'info', 'support', 'service'
  ],
  forums: [
    'group', 'forum', 'list', 'discuss', 'community', 'members',
    'subscribe', 'listserv'
  ]
};

// Keywords for different categories
const CATEGORY_KEYWORDS = {
  social: [
    'connection', 'connect', 'friend', 'follow', 'network', 'invitation',
    'social', 'profile', 'post', 'shared', 'like', 'comment'
  ],
  promotions: [
    'offer', 'discount', 'sale', 'promotion', 'deal', 'coupon', 'limited',
    'exclusive', 'subscribe', 'newsletter', 'marketing', 'price', 'off',
    'free', 'save', 'buy', 'purchase'
  ],
  updates: [
    'update', 'notification', 'alert', 'receipt', 'invoice', 'payment',
    'order', 'shipped', 'delivery', 'account', 'password', 'security',
    'verify', 'confirmation', 'summary', 'statement'
  ],
  forums: [
    'thread', 'topic', 'discussion', 'forum', 'group', 'reply', 'post',
    'mailing list', 'subscribe', 'unsubscribe', 'digest'
  ],
  important: [
    'urgent', 'important', 'critical', 'attention', 'required',
    'action needed', 'deadline', 'asap', 'emergency'
  ]
};

/**
 * Categorize an email based on content and metadata
 * @param {string} subject - Email subject
 * @param {string} body - Email body content
 * @param {string} from - Sender email address or name+address
 * @returns {string} - Email category
 */
export const categorizeEmail = (subject = '', body = '', from = '') => {

  body = typeof body === 'string' ? body : (body ? JSON.stringify(body) : "");

  subject = (subject || '').toLowerCase();
  body = (body || '').toLowerCase();
  from = (from || '').toLowerCase();
  
  // Extract domain from sender
  const emailMatch = from.match(/<([^<>]+@[^<>]+)>/) || from.match(/([^\s]+@[^\s]+)/);
  const senderEmail = emailMatch ? emailMatch[1] : '';
  const senderDomain = senderEmail.split('@')[1] || '';
  
  // Check against known patterns in sender domain
  for (const [category, domainPatterns] of Object.entries(DOMAIN_PATTERNS)) {
    if (domainPatterns.some(pattern => 
      senderDomain.includes(pattern) || senderEmail.includes(pattern))) {
      return category;
    }
  }
  
  // Check for automated/system emails
  if (from.includes('noreply') || from.includes('no-reply') || from.includes('donotreply')) {
    return 'updates';
  }
  
  // Check subject and body for category keywords
  const combinedText = `${subject} ${body.substring(0, 1000)}`;
  
  // First check for important emails
  if (CATEGORY_KEYWORDS.important.some(keyword => combinedText.includes(keyword))) {
    return 'important';
  }
  
  // Then check other categories
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'important') continue; // Already checked
    
    // Count how many keywords match
    const matchCount = keywords.reduce((count, keyword) => 
      count + (combinedText.includes(keyword) ? 1 : 0), 0);
    
    // If 2+ keywords match, categorize accordingly
    if (matchCount >= 2) {
      return category;
    }
  }
  
  // Special case for transaction emails
  if (subject.includes('receipt') || subject.includes('invoice') || 
      subject.includes('order') || subject.includes('payment') ||
      subject.includes('transaction')) {
    return 'updates';
  }
  
  // Default fallback for personal emails
  return 'primary';
};

/**
 * Identify email subtype for more specific categorization
 * @param {Object} email - Email object with subject, body, etc.
 * @returns {string} - Email subtype
 */
export const identifyEmailSubtype = (email) => {
  const subject = (email.subject || '').toLowerCase();
  const body = (email.body?.text || '').toLowerCase();
  const from = (email.from?.email || '').toLowerCase();
  
  // Identify receipts and invoices
  if (subject.includes('receipt') || subject.includes('invoice') || 
      subject.includes('payment') || subject.includes('order confirmation')) {
    return 'receipt';
  }
  
  // Identify notifications
  if (subject.includes('notification') || 
      subject.includes('alert') || 
      subject.includes('update available')) {
    return 'notification';
  }
  
  // Identify newsletters
  if (subject.includes('newsletter') || 
      subject.match(/issue #\d+/) || 
      subject.match(/weekly|monthly|daily update/i)) {
    return 'newsletter';
  }
  
  // Identify marketing emails
  if (subject.includes('off') && (subject.includes('%') || subject.includes('discount'))) {
    return 'marketing';
  }
  
  // Identify system emails
  if (from.includes('noreply') || from.includes('system') || from.includes('automated')) {
    return 'system';
  }
  
  // Default to "message" for general emails
  return 'message';
};

/**
 * Check if email is likely a bulk/automated message
 * @param {Object} email - Email object with headers and content
 * @returns {boolean} - True if email appears to be bulk/automated
 */
export const isBulkEmail = (email) => {
  // Check for bulk email indicators
  if (email.from?.email?.includes('noreply') || 
      email.from?.email?.includes('no-reply') ||
      email.from?.email?.includes('donotreply')) {
    return true;
  }
  
  // Check for list-unsubscribe header
  if (email.headers && 
      (email.headers['list-unsubscribe'] || 
       email.headers['List-Unsubscribe'])) {
    return true;
  }
  
  // Check for unsubscribe links in body
  if (email.body?.text?.toLowerCase().includes('unsubscribe') ||
      email.body?.html?.toLowerCase().includes('unsubscribe')) {
    return true;
  }
  
  // Check common bulk email patterns in body text
  const bulkIndicators = [
    'view in browser',
    'email preference',
    'privacy policy',
    'terms of service',
    'to unsubscribe',
    'received this email because',
    'newsletter',
    'update your preferences',
    'you are receiving this email because'
  ];
  
  const bodyText = email.body?.text?.toLowerCase() || '';
  if (bulkIndicators.some(indicator => bodyText.includes(indicator))) {
    return true;
  }
  
  return false;
};

/**
 * Determine folder suggestion for an email
 * @param {Object} email - Email object
 * @returns {string} - Suggested folder name
 */
export const suggestEmailFolder = (email) => {
  // Base suggestion on category
  const category = categorizeEmail(
    email.subject,
    email.body?.text || '',
    email.from?.email || ''
  );
  
  // Map categories to folders
  const categoryToFolder = {
    'primary': 'inbox',
    'social': 'social',
    'promotions': 'promotions',
    'updates': 'updates',
    'forums': 'forums',
    'important': 'important',
    'unclassified': 'inbox'
  };
  
  return categoryToFolder[category] || 'inbox';
};

export default {
  categorizeEmail,
  identifyEmailSubtype,
  isBulkEmail,
  suggestEmailFolder,
  CATEGORY_DEFINITIONS
};