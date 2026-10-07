import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { testConnection } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import streakRoutes from './routes/streakRoutes.js';
import badgeRoutes from './routes/badgeRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.json({
    status: 'online',
    app: 'Daycraft API',
    database: dbStatus.ok ? 'connected' : 'disconnected',
    error: dbStatus.error || null,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/streaks', streakRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/stats', statsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: `API route ${req.method} ${req.url} not found.` });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error.',
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`========================================`);
  console.log(`🚀 Daycraft Server running on port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`========================================`);

  const dbStatus = await testConnection();
  if (dbStatus.ok) {
    console.log('✅ Connected to MySQL database "daycraft" successfully.');
  } else {
    console.warn('⚠️  MySQL connection note:', dbStatus.error);
    console.warn('👉 Ensure your MySQL credentials are set in backend/.env');
  }
});
