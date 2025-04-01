import mongoose from 'mongoose';

// Define connected email schema separately to ensure proper subdocument handling
const connectedEmailSchema = new mongoose.Schema({
  email: { type: String, required: true },
  provider: { type: String, required: true },
  autoReplyEnabled: { type: Boolean, default: false },
  mode: { type: String, default: 'normal' },
  status: { type: String, default: 'active' },
  lastSync: { type: Date, default: Date.now },
  type: { type: String, default: 'personal' },
  syncEnabled: { type: Boolean, default: true },
  picture: { type: String },
  name: { type: String },
});

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true},
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function () {
    return !this.googleId; // Password is required if the user is not authenticated with Google
  }},
  profilePicture: { type: String },
  connectedEmails: [connectedEmailSchema],
  isVerified: {
    type: Boolean,
    default: false,
  },
  urls: [
    {
      url: { type: String, required: true },
      charCount: { type: Number, required: true },
    },
  ],
  googleAuth: {
    refreshToken: String,
    accessToken: String,
    expiryDate: Number,
    email: String,
    name: String
  },
  status: {
    type: String,
    enum: ['active', 'error', 'paused', 'disconnected'],
    default: 'active'
  },
  lastConnected: {
    type: Date,
    default: Date.now
  },
  // Email usage tracking
  connectedEmailsCount: {
    type: Number,
    default: 0
  },
  emailsSentCount: {
    type: Number,
    default: 0
  },
  emailsSentThisPeriod: {
    type: Number,
    default: 0
  },
  lastPeriodReset: {
    type: Date,
    default: Date.now
  },
  
  // Subscription fields
  subscriptionPlan: {
    type: String, 
    enum: ['free', 'pro_monthly', 'pro_yearly', 'business'],
    default: 'free'
  },
  subscriptionStartDate: Date,
  subscriptionEndDate: Date,
}, { timestamps: true });

// Add a pre-save middleware to automatically update connectedEmailsCount
userSchema.pre('save', function(next) {
  // Update connectedEmailsCount to match the array length
  if (this.isModified('connectedEmails')) {
    this.connectedEmailsCount = Array.isArray(this.connectedEmails) ? this.connectedEmails.length : 0;
  }
  next();
});

// Add static methods to the User model
userSchema.statics.updateConnectedEmailsCount = async function(userId) {
  try {
    // If userId is provided, update only that user
    if (userId) {
      const user = await this.findById(userId);
      if (!user) return { updated: 0 };
      
      const emailCount = Array.isArray(user.connectedEmails) ? user.connectedEmails.length : 0;
      
      if (user.connectedEmailsCount !== emailCount) {
        await this.findByIdAndUpdate(userId, { 
          $set: { connectedEmailsCount: emailCount } 
        });
        return { updated: 1, userId };
      }
      
      return { updated: 0 };
    }
    
    // Otherwise update all users
    const users = await this.find({});
    let updated = 0;
    
    for (const user of users) {
      const emailCount = Array.isArray(user.connectedEmails) ? user.connectedEmails.length : 0;
      
      if (user.connectedEmailsCount !== emailCount) {
        await this.findByIdAndUpdate(user._id, {
          $set: { connectedEmailsCount: emailCount }
        });
        updated++;
      }
    }
    
    return { updated };
  } catch (error) {
    console.error('Error updating connected emails count:', error);
    throw error;
  }
};

// Add middleware for findOneAndUpdate to update connectedEmailsCount
// This is a bit tricky since findOneAndUpdate bypasses document middleware
userSchema.pre('findOneAndUpdate', async function(next) {
  try {
    const update = this.getUpdate();
    
    // If connectedEmails array is being modified, update the count
    if (update.$set?.connectedEmails || update.$push?.connectedEmails || update.$pull?.connectedEmails) {
      // Get the current document
      const docToUpdate = await this.model.findOne(this.getQuery());
      if (!docToUpdate) return next();
      
      let newCount = docToUpdate.connectedEmailsCount;
      
      // Calculate new count based on the operation
      if (update.$set?.connectedEmails) {
        // Direct set - use the new array's length
        newCount = Array.isArray(update.$set.connectedEmails) ? update.$set.connectedEmails.length : 0;
      } else if (update.$push?.connectedEmails) {
        // Adding one or more emails
        const pushCount = Array.isArray(update.$push.connectedEmails.$each) 
          ? update.$push.connectedEmails.$each.length 
          : 1;
        newCount += pushCount;
      } else if (update.$pull?.connectedEmails) {
        // Removing emails - we need to check how many match the pull condition
        const pullQuery = update.$pull.connectedEmails;
        const currentEmails = docToUpdate.connectedEmails || [];
        
        // Count how many emails match the pull criteria
        const removedCount = currentEmails.filter(email => {
          // Simple equality check for string conditions
          if (typeof pullQuery === 'string') {
            return email === pullQuery;
          }
          
          // Object condition matching
          return Object.entries(pullQuery).every(([key, value]) => email[key] === value);
        }).length;
        
        newCount -= removedCount;
      }
      
      // Ensure count is not negative
      if (newCount < 0) newCount = 0;
      
      // Update the count in the same update operation
      if (!update.$set) update.$set = {};
      update.$set.connectedEmailsCount = newCount;
    }
    
    next();
  } catch (error) {
    console.error('Error in findOneAndUpdate middleware:', error);
    next(error);
  }
});

// Create the model
const User = mongoose.model('User', userSchema);

// Helper function to fix all users' counts
export const fixAllConnectedEmailsCounts = async () => {
  return await User.updateConnectedEmailsCount();
};

export default User;