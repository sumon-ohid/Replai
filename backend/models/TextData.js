import mongoose from 'mongoose';

const textDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  text: {
    type: String,
  },
  fileData: {
    type: String,
  },
  webData: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

const TextData = mongoose.model('TextData', textDataSchema);

export default TextData;

