// routes/folderRoutes.js
const express = require('express');
const Folder = require('../models/Folder');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware for JWT verification
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Authorization token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Invalid token:', error);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Create folder
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, parentFolder } = req.body;

    // Check if a folder with the same name already exists
    const existingFolder = await Folder.findOne({
      name,
      uploadedBy: req.userId,
      parentFolder: parentFolder || null,
    });

    if (existingFolder) {
      return res.status(409).json({ message: 'Folder already exists' });
    }

    const folder = new Folder({
      name,
      uploadedBy: req.userId,
      parentFolder: parentFolder || null,
    });
    await folder.save();

    res.status(201).json({ message: 'Folder created successfully', folder });
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ message: 'Error creating folder', error });
  }
});

module.exports = router;