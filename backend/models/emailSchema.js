import mongoose from 'mongoose';

const emailSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  provider: {
    type: String,
    enum: ['google', 'outlook', 'custom'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'error', 'syncing', 'disconnected'],
    default: 'inactive'
  },
  tokens: {
    accessToken: String,
    refreshToken: String,
    expiresAt: Date
  },
  credentials: {
    // For custom IMAP/SMTP
    username: String,
    password: String,
    imapHost: String,
    imapPort: Number,
    smtpHost: String,
    smtpPort: Number,
    secure: Boolean
  },
  syncConfig: {
    enabled: {
      type: Boolean,
      default: true
    },
    interval: {
      type: Number,
      default: 60000 // 1 minute
    },
    folders: {
      type: [String],
      default: ['inbox']
    },
    markAsRead: {
      type: Boolean,
      default: false
    },
    includeAttachments: {
      type: Boolean,
      default: false
    },
    lastSyncedMessageId: String
  },
  aiSettings: {
    mode: {
      type: String,
      enum: ['off', 'suggest', 'draft', 'auto-send'],
      default: 'suggest'
    },
    categories: [{
      name: String,
      rules: [String],
      priority: Number
    }],
    responseTemplates: [{
      name: String,
      content: String,
      category: String,
      variables: [String]
    }],
    rules: [{
      condition: String,
      action: String,
      template: String,
      enabled: Boolean
    }],
    blacklist: [String],
    whitelist: [String],
    maxDailyResponses: {
      type: Number,
      default: 100
    }
  },
  stats: {
    lastSync: Date,
    totalEmails: {
      type: Number,
      default: 0
    },
    processedEmails: {
      type: Number,
      default: 0
    },
    autoRespondedEmails: {
      type: Number,
      default: 0
    },
    draftCreatedEmails: {
      type: Number,
      default: 0
    },
    failedAttempts: {
      type: Number,
      default: 0
    },
    retryAttempts: {
      type: Number,
      default: 0
    },
    errorCount: {
      type: Number,
      default: 0
    },
    averageResponseTime: Number,
    categoriesDistribution: {
      type: Map,
      of: Number
    }
  },
  notifications: {
    enabled: {
      type: Boolean,
      default: true
    },
    channels: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: false
      }
    },
    types: {
      sync: {
        type: Boolean,
        default: true
      },
      error: {
        type: Boolean,
        default: true
      },
      automation: {
        type: Boolean,
        default: true
      }
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
emailSchema.index({ userId: 1, email: 1 }, { unique: true });
emailSchema.index({ provider: 1 });
emailSchema.index({ status: 1 });
emailSchema.index({ 'stats.lastSync': 1 });

// Virtual for connection status
emailSchema.virtual('isConnected').get(function() {
  return this.status === 'active' && 
         (!this.tokens?.expiresAt || new Date(this.tokens.expiresAt) > new Date());
});

// Pre-save middleware for validation
emailSchema.pre('save', function(next) {
  // Validate provider-specific fields
  if (this.provider === 'custom' && (!this.credentials.imapHost || !this.credentials.smtpHost)) {
    next(new Error('Custom email provider requires IMAP and SMTP configuration'));
  }

  if (['google', 'outlook'].includes(this.provider) && !this.tokens.refreshToken) {
    next(new Error('OAuth providers require refresh token'));
  }

  next();
});

// Methods
emailSchema.methods.updateStats = async function(stats) {
  Object.assign(this.stats, stats);
  await this.save();
};

emailSchema.methods.updateStatus = async function(status) {
  this.status = status;
  await this.save();
};

emailSchema.methods.updateTokens = async function(tokens) {
  this.tokens = { ...this.tokens, ...tokens };
  await this.save();
};

// Statics
emailSchema.statics.getActiveAccounts = function() {
  return this.find({ status: 'active' });
};

emailSchema.statics.getUserAccounts = function(userId) {
  return this.find({ userId });
};

emailSchema.statics.getProviderAccounts = function(provider) {
  return this.find({ provider });
};

const EmailAccount = mongoose.models.EmailAccount || 
  mongoose.model('EmailAccount', emailSchema);

export default EmailAccount;
