import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { testConnection } from './config/db.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import volunteerRoutes from './routes/volunteerRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL ? [process.env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'] : true,
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
app.use('/api/auth', authRoutes);
app.use('/api/users', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/volunteer', volunteerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', adminRoutes); // mounts /api/stats/summary & /api/notifications

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`🚀 ServeHub Backend running at http://localhost:${PORT}`);
  console.log(`====================================================`);
  await testConnection();
});
