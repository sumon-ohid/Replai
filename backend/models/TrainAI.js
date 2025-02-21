import User from '../models/User.js';
import TextData from '../models/TextData.js';

const trainAI = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const textData = await TextData
      .find({ userId })
      .select('text')
      .lean();

    const fileData = await TextData
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

    console.log('AI training completed');
  } catch (error) {
    console.error('Error training AI:', error);
    throw error;
  }
};

export default trainAI;