const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// Body Parser Middleware (50mb to comfortably handle high-resolution image uploads)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS Policy - Correctly reflect origin with credentials (avoids browser 'Failed to fetch' with wildcard origin)
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.startsWith('http://localhost:') ||
        origin.startsWith('http://127.0.0.1:')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Route Imports
const authRoutes = require('./routes/authRoutes');
const produceRoutes = require('./routes/produceRoutes');
const bulkProcurementRoutes = require('./routes/bulkProcurementRoutes');
const orderRoutes = require('./routes/orderRoutes');
const qualityRoutes = require('./routes/qualityRoutes');
const logisticsRoutes = require('./routes/logisticsRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiProxyRoutes = require('./routes/aiProxyRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const marketDataRoutes = require('./routes/marketDataRoutes');
const forecastRoutes = require('./routes/forecastRoutes');
const priceIntelligenceRoutes = require('./routes/priceIntelligenceRoutes');
const farmerActionRoutes = require('./routes/farmerActionRoutes');
const mandiOptimizerRoutes = require('./routes/mandiOptimizerRoutes');
const fpoRoutes = require('./routes/fpoRoutes');
const farmerHubRoutes = require('./routes/farmerHubRoutes');

// API Mounts
app.use('/api/auth', authRoutes);
app.use('/api/products', produceRoutes);
app.use('/api/bulk/requests', bulkProcurementRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/quality', qualityRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', aiProxyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/market-data', marketDataRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/price-intelligence', priceIntelligenceRoutes);
app.use('/api/farmer-action', farmerActionRoutes);
app.use('/api/mandi-optimizer', mandiOptimizerRoutes);
app.use('/api/market-intelligence/optimizer', mandiOptimizerRoutes);
app.use('/api/fpo', fpoRoutes);
app.use('/api/farmer-hub', farmerHubRoutes);

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'KisanSetu AI Backend Service',
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

// Start Server ONLY AFTER Database is connected & seeded!
const startServer = async () => {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`  🌾 KisanSetu AI Backend Server Running on Port ${PORT}`);
      console.log(`  Target Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  API Health Endpoint: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`=======================================================`);
        console.log(`  🌾 KisanSetu AI Backend is ALREADY running on Port ${PORT}`);
        console.log(`  API Health Endpoint: http://localhost:${PORT}/api/health`);
        console.log(`=======================================================`);
      } else {
        console.error('Server runtime error:', err);
      }
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();
