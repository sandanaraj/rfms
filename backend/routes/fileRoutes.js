const express = require('express');
const multer = require('multer');
const File = require('../models/File');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) => cb(null, file.originalname),
});
const upload = multer({ storage });

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Upload a file
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    const { parentFolder = null } = req.body;
    const existing = await File.findOne({
      filename: req.file.originalname,
      uploadedBy: req.userId,
      parentFolder,
    });

    const filePath = `https://0z8hxp4d-5000.inc1.devtunnels.ms/uploads/${req.file.originalname}`;
    console.log('File path:', filePath);    
    if (existing) {
      existing.filePath = filePath;
      existing.fileType = req.file.mimetype;
      await existing.save();
    } else {
      await File.create({
        filename: req.file.originalname,
        filePath,
        fileType: req.file.mimetype,
        uploadedBy: req.userId,
        parentFolder,
        isFolder: false,
      });
    }

    res.status(201).json({ message: 'Uploaded successfully' });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: 'Upload failed' });
  }
});

// Create folder
router.post('/create-folder', authenticateToken, async (req, res) => {
  try {
    const { folderName, parentFolder } = req.body;

    const exists = await File.findOne({
      filename: folderName,
      uploadedBy: req.userId,
      parentFolder: parentFolder || null,
      isFolder: true,
    });

    if (exists) return res.status(400).json({ message: 'Folder already exists' });

    const folder = await File.create({
      filename: folderName,
      fileType: 'folder',
      filePath: '/',
      uploadedBy: req.userId,
      parentFolder: parentFolder || null,
      isFolder: true,
    });

    res.status(201).json({ message: 'Folder created', folder });
  } catch (err) {
    console.error('Folder creation error:', err);
    res.status(500).json({ message: 'Failed to create folder' });
  }
});

// Get files (including folders) for a folder
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { parentFolder = null } = req.query;
    const files = await File.find({
      uploadedBy: req.userId,
      parentFolder: parentFolder || null,
    });

    const result = files.map(file => ({
      ...file.toObject(),
      fileUrl: file.isFolder
        ? null
        : `${req.protocol}://${req.get('host')}/uploads/${encodeURIComponent(path.basename(file.filePath))}`,
    }));

    res.json(result);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ message: 'Fetch failed' });
  }
});

router.delete('/:id',authenticateToken, async (req,res) => {
  try{
    const file = await File.findOne({
      _id: req.params.id,
      uploadedBy: req.userId
    });
    if(!file) return res.status(404).json({message: 'File not found'});

    if(file.isFolder)
    {
      await deleteFolderRecursively(file._id,req.userId);
      await file.deleteOne();
    }
    else
    {
      if(fs.existsSync(file.filePath)){
        fs.unlinkSync(file.filePath);
      } 
      await file.deleteOne();
      res.status(200).json({message: 'File deleted successfully'});
    }
  }
  catch(err){
    console.error('Delete error:', err);
    res.status(500).json({message: 'Failed to delete file'});
  }
});

const deleteFolderRecursively = async (folderId,userId) =>{
  const contents = await File.find({parentFolder:folderId,uploadedBy:userId});

  for(const item of contents)
  {
    if(item.isFolder)
    {
      await deleteFolderRecursively(item._id,userId);
    }
    else{
      if(fs.existsSync(item.filePath)){
        fs.unlinkSync(item.filePath);
      } 
      await item.deleteOne();
    }
  }
};

// Serve static files
router.use('/uploads', express.static(uploadPath));

module.exports = router;