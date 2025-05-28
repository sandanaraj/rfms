// models/Folder.js
const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parentFolder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Folder', folderSchema);