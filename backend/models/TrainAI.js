import mongoose from 'mongoose';

const TrainAISchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  communicationStyle: {
    type: String,
    enum: ['professional', 'casual', 'formal', 'friendly'],
    default: 'professional'
  },
  companyVoice: {
    type: String,
    default: 'neutral'
  },
  industryContext: {
    type: String,
    default: 'general'
  },
  keyPhrases: {
    type: [String],
    default: []
  },
  personalizations: {
    type: Object,
    default: {}
  },
  lastTrained: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Keep the original trainAI function
export const trainAI = async (userId) => {
  try {
    const user = await mongoose.model('User').findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const textData = await mongoose.model('TextData')
      .find({ userId })
      .select('text')
      .lean();

    const fileData = await mongoose.model('TextData')
      .find({ userId })
      .select('fileData')
      .lean();

    const trainingData = {
      textData,
      fileData,
    };

    // Add your AI training logic here using the trainingData
    console.log('Training AI with data:', trainingData);

    // Simulate AI training
    await new Promise((resolve) => setTimeout(resolve, 3000));
    
    // Update or create TrainAI document
    await TrainAIModel.findOneAndUpdate(
      { userId },
      { 
        lastTrained: new Date(),
        // Add other fields if needed
      },
      { upsert: true, new: true }
    );

    console.log('AI training completed');
  } catch (error) {
    console.error('Error training AI:', error);
    throw error;
  }
};

// Create and export the TrainAI model
const TrainAIModel = mongoose.model('TrainAI', TrainAISchema);
export default TrainAIModel;