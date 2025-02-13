import mongoose from 'mongoose';

const sentEmailSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  dateSent: { type: Date, default: Date.now },
});

const SentEmail = mongoose.model('SentEmail', sentEmailSchema);

export default SentEmail;