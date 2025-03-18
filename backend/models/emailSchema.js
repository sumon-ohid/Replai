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
      name: { type: String, default: '' },
      email: { type: String, required: true }
    },
    to: { type: String },
    cc: { type: String },
    bcc: { type: String },
    subject: { type: String, default: '(No Subject)' },
    date: { type: Date, required: true },
    receivedAt: { type: Date },
    read: { type: Boolean, default: false },
    
    // Content
    body: { type: String, default: '' },
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
    
    // Analysis
    category: { type: String, default: 'uncategorized' },
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
  
  // Check if model already exists to avoid recompilation warning
  return mongoose.models[modelName] || mongoose.model(modelName, emailSchema);
};

export default getEmailModel;