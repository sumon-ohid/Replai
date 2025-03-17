import mongoose from 'mongoose';

/**
 * Creates a dynamic Email model for each user
 * @param {string} userId - The user ID to create a collection for
 * @returns {mongoose.Model} - Mongoose model for the user's emails
 */
const getEmailModel = (userId) => {
  const emailSchema = new mongoose.Schema({
    // Reference to user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true
    },
    
    // Email metadata
    messageId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    threadId: {
      type: String,
      required: true,
      index: true
    },
    
    // Email content
    subject: {
      type: String,
      default: '(No Subject)'
    },
    snippet: String,
    body: {
      text: String,
      html: String
    },
    
    // Email participants
    from: {
      name: String,
      email: {
        type: String,
        required: true,
        index: true
      }
    },
    to: [{
      name: String,
      email: String
    }],
    cc: [{
      name: String,
      email: String
    }],
    bcc: [{
      name: String,
      email: String
    }],
    
    // Email time and status
    date: {
      type: Date,
      required: true,
      index: true
    },
    receivedDate: {
      type: Date,
      default: Date.now,
      index: true
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    isImportant: {
      type: Boolean,
      default: false,
      index: true
    },
    isStarred: {
      type: Boolean,
      default: false,
      index: true
    },
    
    // Email folder and category
    labelIds: {
      type: [String],
      default: [],
      index: true
    },
    folder: {
      type: String,
      enum: ['inbox', 'sent', 'drafts', 'trash', 'spam', 'archive', 'custom'],
      default: 'inbox',
      index: true
    },
    
    // Email classification and AI processing
    category: {
      type: String, 
      enum: ['primary', 'social', 'promotions', 'updates', 'forums', 'important', 'unclassified'],
      default: 'unclassified',
      index: true
    },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'negative', 'mixed', 'unknown'],
      default: 'unknown'
    },
    priority: {
      type: Number,  // 1-5 (1 is highest)
      default: 3,
      index: true
    },
    
    // AI processing status - THIS IS THE KEY CHANGE
    processed: {
      type: Boolean,
      default: false,
      index: true
    },
    processingStatus: {
      type: String,
      enum: ['pending', 'processing', 'processed', 'failed', 'skipped'],
      default: 'pending',
      index: true
    },
    processingLog: [{
      timestamp: {
        type: Date,
        default: Date.now
      },
      status: String,
      message: String
    }],
    processingTime: {
      type: Number, // Time taken to process in ms
      default: 0
    },
    processingDate: {
      type: Date,
      index: true
    },
    
    // Email actions
    hasReplies: {
      type: Boolean,
      default: false
    },
    replyCount: {
      type: Number,
      default: 0
    },
    autoReplied: {
      type: Boolean,
      default: false,
      index: true // Add index for stats queries
    },
    
    // Attachments
    hasAttachments: {
      type: Boolean,
      default: false
    },
    attachments: [{
      filename: String,
      contentType: String,
      size: Number,
      contentId: String,
      path: String
    }],
    
    // Internal tracking and metadata
    source: {
      type: String,
      enum: ['gmail', 'outlook', 'imap', 'smtp', 'api', 'other'],
      default: 'other'
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    
    // System timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }, { 
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    strict: false // Allow additional fields
  });
  
  // Add text index for search
  emailSchema.index({
    'subject': 'text',
    'body.text': 'text',
    'from.name': 'text',
    'from.email': 'text'
  });
  
  // Pre-save middleware to ensure dates are handled properly
  emailSchema.pre('save', function(next) {
    if (!this.receivedDate) {
      this.receivedDate = new Date();
    }
    
    // Sync processingStatus with processed boolean
    if (this.processingStatus === 'processed' && !this.processed) {
      this.processed = true;
      if (!this.processingDate) {
        this.processingDate = new Date();
      }
    }
    
    next();
  });
  
  // Virtual for time to process
  emailSchema.virtual('timeToProcess').get(function() {
    if (this.processingDate && this.receivedDate) {
      return this.processingDate - this.receivedDate;
    }
    return null;
  });
  
  // Ensure we don't recreate the model if it already exists
  const modelName = `Email_${userId}`;
  return mongoose.models[modelName] || mongoose.model(modelName, emailSchema);
};

export default getEmailModel;