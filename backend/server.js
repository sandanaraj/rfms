// server.js
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const folderRoutes = require('./routes/folderRoutes');
const userRoutes = require('./routes/userRoutes');
const path = require('path');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/user', userRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});