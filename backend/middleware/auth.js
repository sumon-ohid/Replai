import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log('Decoded:', decoded);
    // console.log('Token:', token);
    // Find user by ID
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    // console.log('User authenticated:', user._id);
    next();
  } catch (error) {
    res.status(401).send({ error: 'Please authenticate.' });
  }
};

export default auth;