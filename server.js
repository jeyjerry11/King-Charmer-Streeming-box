const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://KingCharmerStreeming:Asdf0909@cluster0.il7ja6v.mongodb.net/kc_streaming?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// ===== Schemas =====
const StreamSchema = new mongoose.Schema({
  videoId: { type: String, required: true },
  seconds: Number,
  provider: { type: String, required: true }, // ✅ Add provider
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

const ViewSchema = new mongoose.Schema({
  videoId: String,
  title: String,
  provider: String, // ✅ Track provider for analytics
  timestamp: { type: Date, default: Date.now }
});

// ===== Models =====
const StreamLog = mongoose.model('StreamLog', StreamSchema);
const DownloadLog = mongoose.model('DownloadLog', DownloadSchema);
const Video = mongoose.model('Video', UploadSchema);
const View = mongoose.model('View', ViewSchema);

// ===== ROUTES =====

// Track streams (with provider)
app.post('/api/track-stream', async (req, res) => {
  try {
    const { videoId, seconds, provider } = req.body;
    if (!videoId || !provider) return res.status(400).json({ error: 'videoId and provider required' });

    const stream = new StreamLog({ videoId, seconds, provider });
    await stream.save();

    console.log(`📺 Stream logged: ${videoId}, ${seconds || 0}s, Provider: ${provider}`);
    res.status(201).json({ message: 'Stream logged' });
  } catch (err) {
    console.error('Stream log error:', err);
    res.status(500).json({ error: 'Failed to log stream' });
  }
});

// Track downloads
app.post('/api/track-download', async (req, res) => {
  try {
    const { videoId, size } = req.body;
    if (!videoId) return res.status(400).json({ error: 'videoId required' });

    const download = new DownloadLog({ videoId, size });
    await download.save();

    console.log(`⬇️ Download logged: ${videoId}, ${size || 0}MB`);
    res.status(201).json({ message: 'Download logged' });
  } catch (err) {
    console.error('Download log error:', err);
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
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Log view (analytics) with provider
app.post("/api/log-view", async (req, res) => {
  try {
    const { videoId, title, provider } = req.body;
    if (!videoId || !provider) return res.status(400).json({ error: 'videoId and provider required' });

    const view = new View({ videoId, title, provider });
    await view.save();

    console.log(`📊 View logged: ${videoId} - ${title}, Provider: ${provider}`);
    res.json({ message: "View saved successfully" });
  } catch (err) {
    console.error('❌ View log error:', err);
    res.status(500).json({ error: "Failed to save view" });
  }
});

// Fetch all videos
app.get('/api/videos', async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.status(200).json(videos);
  } catch (err) {
    console.error('Fetch videos error:', err);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

// Default route
app.get('/', (req, res) => {
  res.send('KC Streaming backend is live 🌐✨');
});

// Start server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🌍 Server running at http://localhost:${PORT}`));