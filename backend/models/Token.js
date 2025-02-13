import mongoose from 'mongoose';

const tokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '1h' } // Token will expire after 1 hour
});

const Token = mongoose.model('Token', tokenSchema);

export default Token;