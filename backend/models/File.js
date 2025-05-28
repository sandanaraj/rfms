const mongoose = require('mongoose');
const fileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  filePath: { type: String, required: true },
  fileType: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parentFolder: { type: mongoose.Schema.Types.ObjectId, ref: 'File' ,default: null },
  isFolder: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('File', fileSchema);