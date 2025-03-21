import mongoose from 'mongoose';

const connectedEmailSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    index: true
  },

  // Email identification
  email: {
    type: String,
    required: true,
    index: true
  },
  provider: {
    type: String,
    required: true,
    enum: ['google', 'outlook', 'custom']
  },
  name: {
    type: String,
    default: ''  // Will be set explicitly in pre-save
  },

  // Authentication
  credentials: {
    // For custom email providers
    username: String,
    password: String,
    server: String,
    port: Number,
    secure: Boolean
  },
  tokens: {
    // For OAuth providers (Google, Outlook)
    accessToken: String,
    refreshToken: String,
    expiry: Date
  },

  // Sync configuration
  syncConfig: {
    enabled: {
      type: Boolean,
      default: true
    },
    folders: {
      type: [String],
      default: ['INBOX']
    },
    interval: {
      type: Number,
      default: 60
    },
    lastSync: Date
  },

  // AI settings
  aiSettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    mode: {
      type: String,
      enum: ['suggest', 'auto', 'disabled'],
      default: 'auto'
    },
    responseTemplates: [{
      name: String,
      template: String,
      useCount: {
        type: Number,
        default: 0
      }
    }]
  },

  // Statistics
  stats: {
    totalEmails: {
      type: Number,
      default: 0
    },
    lastSync: Date,
    syncHistory: [{
      date: Date,
      emailsProcessed: Number,
      success: Boolean,
      error: String
    }]
  },

  // Connection status
  status: {
    type: String,
    enum: ['active', 'paused', 'error', 'disconnected'],
    default: 'disconnected'
  },
  lastError: {
    message: String,
    date: Date,
    code: String
  }
}, {
  timestamps: true
});

// Pre-save middleware to set name if not provided
connectedEmailSchema.pre('save', function(next) {
  if (!this.name && this.email) {
    this.name = this.email.split('@')[0];
  }
  next();
});

// Indexes
connectedEmailSchema.index({ userId: 1, email: 1 }, { unique: true });
connectedEmailSchema.index({ 'stats.lastSync': -1 });
connectedEmailSchema.index({ status: 1 });

const ConnectedEmail = mongoose.model('ConnectedEmail', connectedEmailSchema);

export default ConnectedEmail;
