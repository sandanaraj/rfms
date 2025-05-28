// routes/userRoutes.js
const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for token validation
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.userId });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    console.error('User profile fetch error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  const { username, email } = req.body;

  try {
    const updatedUser = await User.findOneAndUpdate(
      { userId: req.user.userId },
      { username, email },
      { new: true, runValidators: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('User profile update error:', error);
    res.status(500).json({ message: 'Profile update failed', error });
  }
});

// Delete user account
router.delete('/profile', authenticateToken, async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({ userId: req.user.userId });

    if (!deletedUser) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('User account deletion error:', error);
    res.status(500).json({ message: 'Account deletion failed', error });
  }
});

module.exports = router;
