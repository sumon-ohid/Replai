import mongoose from 'mongoose';

const trainingJobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  sources: {
    textData: Boolean,
    fileData: Boolean,
    websiteData: Boolean
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  phase: {
    type: String,
    default: 'Initializing'
  },
  steps: {
    total: {
      type: Number,
      default: 5
    },
    completed: {
      type: Number,
      default: 0
    },
    current: {
      type: String,
      default: 'Preparing training environment'
    }
  },
  error: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const TrainingJob = mongoose.model('TrainingJob', trainingJobSchema);

export default TrainingJob;