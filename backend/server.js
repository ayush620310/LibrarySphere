require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Connect Database
connectDB();

const app = express();

// Middleware
const configuredOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map(url => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

const allowedOrigins = [
  ...configuredOrigins,
  'https://library-sphere-suz9.vercel.app',
  'https://library-management-system-cwup.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
];

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  const clean = origin.trim().replace(/\/$/, '');
  if (allowedOrigins.includes(clean)) return true;
  // Automatically allow all Vercel deployments (*.vercel.app)
  if (clean.endsWith('.vercel.app')) return true;
  // Allow any localhost port
  if (/^http:\/\/localhost(:\d+)?$/.test(clean)) return true;
  return false;
};

app.use(cors({
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-skip-auth', 'x-skip-logout', 'x-library-id'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

const rateLimit = require('express-rate-limit');
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  skip: (req) => req.method === 'OPTIONS',
  message: { success: false, message: 'Too many attempts, try again later.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/signup', authLimiter);

// Routes
// console.log("Auth controller loaded");
app.use('/api/auth', require('./routes/auth'));
app.use('/api/library', require('./routes/library'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/slots', require('./routes/slots'));
app.use('/api/seats', require('./routes/seats'));
app.use('/api/members', require('./routes/members'));
app.use('/api/fees', require('./routes/fees'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get("/api/health", (req, res) => {
  console.log("HEALTH ROUTE HIT");

  res.json({
    status: "ok",
    message: "THIS IS MY MODIFIED SERVER",
  });
});

// Root route
app.get("/", (req, res) => {
  res.json({ success: true, message: "Library Management API is running" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// Error handler
app.use(errorHandler);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
