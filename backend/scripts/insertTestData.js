import mongoose from 'mongoose';
import SentEmail from '../models/SentEmail.js';

mongoose.connect('mongodb://localhost:27017/easy-email', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const testEmails = [
  {
    userId: new mongoose.Types.ObjectId(),
    from: 'ai@example.com',
    to: 'user1@example.com',
    subject: 'Test Email 1',
    body: 'This is a test email body 1.',
  },
  {
    userId: new mongoose.Types.ObjectId(),
    from: 'ai@example.com',
    to: 'user2@example.com',
    subject: 'Test Email 2',
    body: 'This is a test email body 2.',
  },
];

const insertTestData = async () => {
  try {
    await SentEmail.insertMany(testEmails);
    console.log('Test data inserted successfully');
  } catch (error) {
    console.error('Error inserting test data:', error);
  } finally {
    mongoose.connection.close();
  }
};

insertTestData();