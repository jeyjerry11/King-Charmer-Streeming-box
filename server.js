// kc-streaming-backend/server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://KingCharmerStreeming:Asdf0909@cluster0.il7ja6v.mongodb.net/kc_streaming?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// Schemas
const StreamSchema = new mongoose.Schema({
  videoId: { type: String, required: true },
  seconds: Number,
  timestamp: { type: Date, default: Date.now }
});

const DownloadSchema = new mongoose.Schema({
  videoId: { type: String, required: true },
  size: Number,
  timestamp: { type: Date, default: Date.now }
});

const UploadSchema = new mongoose.Schema({
  title: String,
  url: String,
  uploadSize: Number,
  createdAt: { type: Date, default: Date.now }
});

// Models
const StreamLog = mongoose.model('StreamLog', StreamSchema);
const DownloadLog = mongoose.model('DownloadLog', DownloadSchema);
const Video = mongoose.model('Video', UploadSchema);

// Routes

// Track stream
app.post('/api/track-stream', async (req, res) => {
  try {
    const { videoId, seconds } = req.body;
    if (!videoId) return res.status(400).json({ error: 'videoId required' });

    const stream = new StreamLog({ videoId, seconds });
    await stream.save();

    console.log(`📺 Stream logged: ${videoId}, ${seconds}s`);
    res.status(201).json({ message: 'Stream logged' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log stream' });
  }
});

// Track download
app.post('/api/track-download', async (req, res) => {
  try {
    const { videoId, size } = req.body;
    if (!videoId) return res.status(400).json({ error: 'videoId required' });

    const download = new DownloadLog({ videoId, size });
    await download.save();

    console.log(`⬇️ Download logged: ${videoId}, ${size}MB`);
    res.status(201).json({ message: 'Download logged' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log download' });
  }
});

// Upload video
app.post('/api/new-video', async (req, res) => {
  try {
    const { title, url, uploadSize } = req.body;
    const video = new Video({ title, url, uploadSize });
    await video.save();

    console.log(`🎥 New video uploaded: ${title}`);
    res.status(201).json({ message: 'Video uploaded', video });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get all videos
app.get('/api/videos', async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.status(200).json(videos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Default route
app.get('/', (req, res) => {
  res.send('KC Streaming backend is live 🌐✨');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🌍 Server running at http://localhost:${PORT}`)
);