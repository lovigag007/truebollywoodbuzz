require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { sequelize } = require('./models');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security & Middleware ───────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static Files (uploads) ──────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Routes ──────────────────────────────────────────
app.use('/api', routes);

// ─── Health Check ────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ─── 404 ─────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Error Handler ───────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal server error' });
});

// ─── Start ───────────────────────────────────────────────
async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    await sequelize.sync({ alter: false });
    console.log('✅ Models synced');
    app.listen(PORT, () => {
      console.log(`\n🚀 BollywoodReal server running on http://localhost:${PORT}`);
      console.log(`📺 API: http://localhost:${PORT}/api`);
      if (process.env.OTP_DEV_MODE === 'true') {
        console.log('🔐 OTP Dev Mode: ON — OTPs will be logged to console\n');
      }
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
