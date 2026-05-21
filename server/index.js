require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./utils/errorHandler');

// Route imports
const authRoutes          = require('./routes/auth');
const passwordResetRoutes = require('./routes/passwordReset');
const projectRoutes       = require('./routes/projects');
const taskRoutes          = require('./routes/tasks');
const dashboardRoutes     = require('./routes/dashboard');
const userRoutes          = require('./routes/users');

const app = express();

// ── CORS ────────────────────────────────────────────────────────────────────
// Allow any Vercel preview/production URL, localhost, and Railway origins.
const ALLOWED_ORIGINS = [
  /^https:\/\/.*\.vercel\.app$/,          // any Vercel deployment
  /^https:\/\/.*\.up\.railway\.app$/,     // Railway preview URLs
  /^http:\/\/localhost(:\d+)?$/,          // local dev
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];

// Also allow an explicit origin set via env (e.g. your custom domain)
if (process.env.ALLOWED_ORIGIN) {
  ALLOWED_ORIGINS.push(process.env.ALLOWED_ORIGIN);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    const allowed = ALLOWED_ORIGINS.some((rule) =>
      typeof rule === 'string' ? rule === origin : rule.test(origin)
    );
    if (allowed) return callback(null, true);
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/auth',      passwordResetRoutes);
app.use('/api/projects',  projectRoutes);
app.use('/api/tasks',     taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users',     userRoutes);

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ── Error handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
