import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: 'https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg?t=st=1739924219~exp=1739927819~hmac=7c4d5dab938075c812cb0eac803d54afe0704ebc1ea946c76daaf34baef0e9da&w=1380' },
  connectedEmails: [
    {
      email: { type: String, required: true },
      provider: { type: String, required: true }
    }
  ],
});

const User = mongoose.model('User', userSchema);

export default User;