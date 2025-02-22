import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true},
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: function () {
    return !this.googleId; // Password is required if the user is not authenticated with Google
  }},
  profilePicture: { type: String },
  connectedEmails: [
    {
      email: { type: String, required: true },
      provider: { type: String, required: true }
    }
  ],
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
});

const User = mongoose.model('User', userSchema);

export default User;