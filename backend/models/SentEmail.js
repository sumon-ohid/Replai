import mongoose from 'mongoose';

const sentEmailSchema = new mongoose.Schema({
  from: { type: String, required: true },
  to: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  dateSent: { type: Date, default: Date.now },
});

const getSentEmailModel = (userId) => {
  const modelName = `SentEmail_${userId}`;
  if (mongoose.models[modelName]) {
    return mongoose.models[modelName];
  }
  return mongoose.model(modelName, sentEmailSchema);
};

export default getSentEmailModel;