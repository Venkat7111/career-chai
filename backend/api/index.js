require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('../src/routes/auth');
const taskRoutes = require('../src/routes/tasks');
const assignmentRoutes = require('../src/routes/assignments');
const resultRoutes = require('../src/routes/results');
const todoRoutes = require('../src/routes/todos');
const dashboardRoutes = require('../src/routes/dashboard');
const adminUserRoutes = require('../src/routes/admin/users');
const adminTaskRoutes = require('../src/routes/admin/tasks');
const adminAssignmentRoutes = require('../src/routes/admin/assignments');
const adminResultRoutes = require('../src/routes/admin/results');
const settingsRoutes = require('../src/routes/settings');
const challengeRoutes = require('../src/routes/challenges');
const adminChallengeRoutes = require('../src/routes/admin/challenges');

const app = express();

// ─── CORS ───────────────────────────────────────────────────
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'https://career-with-chaithanya.vercel.app',
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('CORS not allowed'));
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// ─── Routes ─────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/tasks', adminTaskRoutes);
app.use('/api/admin/assignments', adminAssignmentRoutes);
app.use('/api/admin/results', adminResultRoutes);
app.use('/api/admin/challenges', adminChallengeRoutes);

// ─── Health check ───────────────────────────────────────────
app.get('/api/health', (req, res) => res.json({ status: 'ok', app: 'Career With Chaithanya' }));

// ─── 404 fallback ───────────────────────────────────────────
app.use('/api/*', (req, res) => res.status(404).json({ error: 'Route not found' }));

// ─── Error handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
