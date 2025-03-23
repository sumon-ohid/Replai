import mongoose from 'mongoose';

const pdfFileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  pages: {
    type: Number,
    default: 0
  },
  extractedText: {
    type: String,
    default: ''
  }
}, { _id: false });

const userDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  textData: {
    type: String,
    default: ''
  },
  pdfFiles: [pdfFileSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the timestamps before saving
userDataSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const UserData = mongoose.model('UserData', userDataSchema);

export default UserData;