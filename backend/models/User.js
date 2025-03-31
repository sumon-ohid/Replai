import { stat } from 'fs';
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

const User = mongoose.model('User', userSchema);

export default User;
