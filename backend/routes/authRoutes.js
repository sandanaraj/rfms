// routes/authRoutes.js
const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();
router.get('/check', (req, res) => {
  res.send('Auth route');
});
// Register route
router.post('/register', async (req, res) => {
  try {
    const {username,password} = req.body;
    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error registering user', error });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Login error', error });
  }
});

module.exports = router;
