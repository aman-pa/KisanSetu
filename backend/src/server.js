const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS Policy
app.use(
  cors({
    origin: '*',
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
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`  🌾 KisanSetu AI Backend Server Running on Port ${PORT}`);
      console.log(`  Target Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  API Health Endpoint: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

startServer();
