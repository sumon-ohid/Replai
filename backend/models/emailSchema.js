import mongoose from 'mongoose';

/**
 * Get a dynamic Email model for a specific user
 */
const getEmailModel = async (userId) => {
  const emailSchema = new mongoose.Schema({
    // Email identification
    provider: { type: String, required: true, enum: ['google', 'outlook', 'custom'] },
    providerId: { type: String, required: true },
    messageId: { type: String, required: true },
    threadId: { type: String, required: true },
    
    // User info
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userEmail: { type: String, required: true },
    
    // Email metadata
    from: {
      email: String,
      name: String
    },
    to: [{
      email: String,
      name: String
    }],
    cc: [{
      email: String,
      name: String
    }],
    bcc: [{
      email: String,
      name: String
    }],
    
    subject: { type: String, default: '(No Subject)' },
    date: { type: Date, required: true },
    receivedAt: { type: Date },
    read: { type: Boolean, default: false },
    
    // Content - IMPORTANT: Changed body from Object to String
    body: {
      text: String,
      html: String
    },
    htmlBody: { type: String },
    snippet: { type: String },
    attachments: [{ 
      name: String, 
      type: String, 
      size: Number,
      content: Buffer
    }],
    
    // Processing
    processed: { type: Boolean, default: false },
    processedAt: { type: Date },
    processingError: { type: String },
    
    // Analysis - IMPORTANT: Include 'uncategorized' in the enum
    category: {
      type: String,
      enum: ['inbox', 'sent', 'draft', 'trash', 'spam', 'important', 'uncategorized'],
      default: 'inbox'
    },
    confidence: { type: Number, default: 0 },
    keywords: [String],
    actionItems: [String],
    requiresResponse: { type: Boolean, default: false },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
    
    // Response tracking
    responded: { type: Boolean, default: false },
    responseId: { type: String },
    responseThreadId: { type: String },
    responseDraft: { type: Boolean, default: false },
    responseAt: { type: Date },
  }, {
    timestamps: true
  });
  
  // Compound index for finding emails by provider and providerId
  emailSchema.index({ provider: 1, providerId: 1 }, { unique: true });
  
  // Indexes for common queries
  emailSchema.index({ userId: 1, category: 1 });
  emailSchema.index({ userId: 1, date: -1 });
  emailSchema.index({ userId: 1, priority: 1 });
  emailSchema.index({ userId: 1, requiresResponse: 1 });
  
  // Dynamically create a model specific to this user
  const modelName = `Email_${userId}`;

  console.log(`Creating Email model for ${userId}`);
  
  // Check if model already exists to avoid recompilation warning
  return mongoose.models[modelName] || mongoose.model(modelName, emailSchema);
};

export default getEmailModel;