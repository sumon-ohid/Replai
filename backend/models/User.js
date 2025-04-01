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

// Add proper middleware for findOneAndUpdate to update connectedEmailsCount
userSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  
  // Check if connectedEmails is being modified in any way
  if (update.$set?.connectedEmails || update.$push?.connectedEmails || update.$pull?.connectedEmails) {
    // Get the document that is being updated
    const docToUpdate = await this.model.findOne(this.getQuery());
    if (!docToUpdate) return next();
    
    let updatedEmails = [...docToUpdate.connectedEmails];
    
    // Handle $set operations
    if (update.$set?.connectedEmails) {
      updatedEmails = update.$set.connectedEmails;
    }
    
    // Handle $push operations
    if (update.$push?.connectedEmails) {
      if (Array.isArray(update.$push.connectedEmails.$each)) {
        updatedEmails = [...updatedEmails, ...update.$push.connectedEmails.$each];
      } else {
        updatedEmails.push(update.$push.connectedEmails);
      }
    }
    
    // Handle $pull operations
    if (update.$pull?.connectedEmails) {
      const criteria = update.$pull.connectedEmails;
      updatedEmails = updatedEmails.filter(email => {
        // Simple equality check for string criteria
        if (typeof criteria === 'string') return email !== criteria;
        // For object criteria, check each property
        if (typeof criteria === 'object') {
          return !Object.entries(criteria).every(([key, value]) => email[key] === value);
        }
        return true;
      });
    }
    
    // Update the count in the same update operation
    if (!update.$set) update.$set = {};
    update.$set.connectedEmailsCount = Array.isArray(updatedEmails) ? updatedEmails.length : 0;
  }
  
  next();
});

// Add static methods to the User model
userSchema.statics.updateConnectedEmailsCount = async function(userId) {
  // ...existing code...
};

// REMOVE THIS DUPLICATE MIDDLEWARE
// userSchema.pre('save', function(next) {
//   if (this.isModified('connectedEmails')) {
//     this.connectedEmailsCount = Array.isArray(this.connectedEmails) ? this.connectedEmails.length : 0;
//   }
//   next();
// });

// Create the model
const User = mongoose.model('User', userSchema);

// Helper function to fix all users' counts
export const fixAllConnectedEmailsCounts = async () => {
  return await User.updateConnectedEmailsCount();
};

export default User;