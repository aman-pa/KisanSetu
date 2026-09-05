import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ConsumerMarketplace from './pages/ConsumerMarketplace';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartCheckoutPage from './pages/CartCheckoutPage';
import FarmerDashboard from './pages/FarmerDashboard';
import AddProducePage from './pages/AddProducePage';
import FPODashboard from './pages/FPODashboard';
import BulkBuyerDashboard from './pages/BulkBuyerDashboard';
import LogisticsDashboard from './pages/LogisticsDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BatchTraceabilityPage from './pages/BatchTraceabilityPage';
import MarketIntelligencePage from './pages/MarketIntelligencePage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/marketplace" element={<ConsumerMarketplace />} />
          <Route path="/market-intelligence" element={<MarketIntelligencePage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartCheckoutPage />} />

          {/* Role Dashboards */}
          <Route path="/farmer/dashboard" element={<FarmerDashboard />} />
          <Route path="/farmer/market-intelligence" element={<MarketIntelligencePage />} />
          <Route path="/farmer/add-produce" element={<AddProducePage />} />
          <Route path="/farmer/produce" element={<FarmerDashboard />} />
          <Route path="/farmer/demand-forecast" element={<MarketIntelligencePage />} />
          <Route path="/farmer/price-recommendation" element={<MarketIntelligencePage />} />
          <Route path="/farmer/quality" element={<FarmerDashboard />} />

          <Route path="/fpo/dashboard" element={<FPODashboard />} />
          <Route path="/buyer/procurement" element={<BulkBuyerDashboard />} />
          <Route path="/logistics/dashboard" element={<LogisticsDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />

          <Route path="/trace/:batchId" element={<BatchTraceabilityPage />} />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
