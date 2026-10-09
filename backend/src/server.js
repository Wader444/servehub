import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { testConnection } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';
import { getCategories } from './controllers/serviceController.js';

import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import volunteerRoutes from './routes/volunteerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Robust CORS for local dev and cloud deployment (e.g. Render, Vercel)
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];
if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(',').forEach(url => allowedOrigins.push(url.trim()));
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.onrender.com') ||
      origin.endsWith('.vercel.app') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive to avoid breaking deployment
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'ServeHub - Community Service Management Portal API',
    timestamp: new Date().toISOString()
  });
});

// Mounted Routes
app.get('/api/categories', getCategories);
app.use('/api/auth', authRoutes);
app.use('/api/users', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', adminRoutes); // mounts /api/stats/summary & /api/notifications

// Serve Static Frontend if built (enables 1-click single-service full-stack deployment)
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`🚀 ServeHub Backend running at http://localhost:${PORT}`);
  console.log(`====================================================`);
  const isConnected = await testConnection();
  if (isConnected) {
    try {
      const { initializeDatabase } = await import('./db/initDb.js');
      await initializeDatabase();
    } catch (initErr) {
      console.warn(`[Auto-Init DB Note] ${initErr.message}`);
    }
  }
});
