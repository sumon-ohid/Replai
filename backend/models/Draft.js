import mongoose from 'mongoose';

/**
 * Creates a dynamic Draft model for each user
 * @param {string} userId - The user ID to create a collection for
 * @returns {mongoose.Model} - Mongoose model for the user's email drafts
 */
const getDraftModel = (userId) => {
  const draftSchema = new mongoose.Schema({
    // Reference to user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true
    },
    
    // Draft status
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'sent', 'discarded'],
      default: 'draft',
      index: true
    },
    
    // Draft content
    subject: String,
    body: {
      text: String,
      html: String
    },
    
    // Draft recipients
    to: [{
      name: String,
      email: {
        type: String,
        required: true
      }
    }],
    cc: [{
      name: String,
      email: String
    }],
    bcc: [{
      name: String,
      email: String
    }],
    
    // Reply/forward data
    replyToEmailId: {
      type: String,
      index: true
    },
    threadId: {
      type: String,
      index: true
    },
    forwardFromEmailId: String,
    
    // AI generation metadata
    isAIGenerated: {
      type: Boolean,
      default: false,
      index: true
    },
    aiGenerationType: {
      type: String,
      enum: ['reply', 'new', 'forward', 'followup', 'custom'],
      default: 'reply'
    },
    aiPrompt: String,
    aiCompletionId: String,
    
    // Scheduling
    scheduledSendTime: {
      type: Date,
      index: true
    },
    
    // Email attachments
    attachments: [{
      filename: String,
      contentType: String,
      size: Number,
      path: String,
      contentId: String
    }],
    hasAttachments: {
      type: Boolean,
      default: false
    },
    
    // Tracking and metadata
    source: {
      type: String,
      enum: ['manual', 'ai-assisted', 'auto-reply', 'scheduled', 'api'],
      default: 'manual'
    },
    sentEmailId: {
      type: String,
      index: true
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    
    // Email sending preferences
    sendPreferences: {
      priority: {
        type: String,
        enum: ['normal', 'high', 'low'],
        default: 'normal'
      },
      requestReadReceipt: {
        type: Boolean,
        default: false
      },
      deliveryOptions: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      }
    },
    
    // Stats tracking fields
    category: {
      type: String,
      default: 'Uncategorized',
      index: true
    },
    disposition: {
      type: String,
      enum: ['saved', 'sent', 'discarded', 'expired'],
      default: 'saved',
      index: true
    },
    
    // Time tracking for stats
    completionTime: {
      type: Number, // Time in ms taken to complete the draft
      default: 0
    },
    editCount: {
      type: Number,
      default: 1
    },
    
    // Version history for drafts
    versions: [{
      timestamp: {
        type: Date,
        default: Date.now
      },
      body: {
        text: String,
        html: String
      },
      subject: String,
      modifiedBy: {
        type: String,
        enum: ['user', 'ai', 'system'],
        default: 'user'
      }
    }],
    
    // System timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    
    // When this draft was sent or discarded
    finalizedAt: {
      type: Date,
      index: true
    }
  }, { 
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
    strict: false // Allow additional fields for flexibility
  });
  
  // Add text index for search
  draftSchema.index({
    'subject': 'text',
    'body.text': 'text'
  });
  
  // Pre-save middleware to track versions and update stats fields
  draftSchema.pre('save', function(next) {
    // Update hasAttachments based on attachments array
    if (this.attachments && this.attachments.length > 0) {
      this.hasAttachments = true;
    } else {
      this.hasAttachments = false;
    }
    
    // Track edit count
    if (!this.isNew && this.isModified('body') || this.isModified('subject')) {
      this.editCount = (this.editCount || 1) + 1;
    }
    
    // Update finalizedAt when status changes to sent or discarded
    if (this.isModified('status')) {
      if (this.status === 'sent' || this.status === 'discarded') {
        this.finalizedAt = new Date();
        this.disposition = this.status === 'sent' ? 'sent' : 'discarded';
      }
    }
    
    // Only add to version history if this is a modification to an existing draft
    if (!this.isNew) {
      const currentVersion = {
        timestamp: new Date(),
        body: this.body,
        subject: this.subject,
        modifiedBy: this.metadata?.lastModifiedBy || 'user'
      };
      
      // Add the current state as a version before saving changes
      if (!this.versions) this.versions = [];
      this.versions.push(currentVersion);
    }
    
    next();
  });
  
  // Helper method to calculate completionTime
  draftSchema.methods.finalize = function(status) {
    this.status = status;
    this.disposition = status === 'sent' ? 'sent' : 'discarded';
    this.finalizedAt = new Date();
    this.completionTime = this.finalizedAt - this.createdAt;
    return this.save();
  };
  
  // Ensure we don't recreate the model if it already exists
  const modelName = `Draft_${userId}`;
  return mongoose.models[modelName] || mongoose.model(modelName, draftSchema);
};

export default getDraftModel;