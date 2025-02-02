require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const apiRoutes = require('./routes/api'); // ✅ Import API routes

const app = express();
app.use(express.json());
app.use(cors());

const { fetchAndCacheHeatmap } = require('./services/heatmapCache'); // ✅ Import caching service

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  })
  .then(async () => {
    console.log('✅ Connected to MongoDB Atlas');
    await fetchAndCacheHeatmap(); // 🔥 Preload heatmap on startup
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });

// ✅ Use API Routes
app.use('/api', apiRoutes);

// ✅ Root Route (Return Cached Heatmap)
app.get('/', async (req, res) => {
  res.redirect('/api/heatmap'); // Redirect homepage to heatmap API
});

// ✅ Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
