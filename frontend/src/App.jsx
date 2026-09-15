import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ConsumerMarketplace from './pages/ConsumerMarketplace';
import ProductDetailsPage from './pages/ProductDetailsPage';
import CartCheckoutPage from './pages/CartCheckoutPage';
import FarmerDashboard from './pages/FarmerDashboard';
import MyProducePage from './pages/MyProducePage';
import AddProducePage from './pages/AddProducePage';
import FPODashboard from './pages/FPODashboard';
import FPOFarmersPage from './pages/FPOFarmersPage';
import FPOProduceInventoryPage from './pages/FPOProduceInventoryPage';
import FPOBulkOrdersPage from './pages/FPOBulkOrdersPage';
import BulkBuyerDashboard from './pages/BulkBuyerDashboard';
import LogisticsDashboard from './pages/LogisticsDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BatchTraceabilityPage from './pages/BatchTraceabilityPage';
import MarketIntelligencePage from './pages/MarketIntelligencePage';
import FPOIntelligencePage from './pages/FPOIntelligencePage';
import ConsumerOrdersPage from './pages/ConsumerOrdersPage';
import TradeTicketPage from './pages/TradeTicketPage';
import FarmerHubPage from './pages/FarmerHubPage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Routes>
          {/* Public Discovery Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/marketplace" element={<ConsumerMarketplace />} />
          <Route path="/market-intelligence" element={<MarketIntelligencePage />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartCheckoutPage />} />
          <Route path="/trace/:batchId" element={<BatchTraceabilityPage />} />
          <Route path="/consumer/orders" element={<ConsumerOrdersPage />} />
          <Route path="/ticket/:id" element={<TradeTicketPage />} />

          {/* Authenticated-Only Farmer Hub Dashboard */}
          <Route
            path="/farmer-hub"
            element={
              <ProtectedRoute>
                <FarmerHubPage />
              </ProtectedRoute>
            }
          />

          {/* Role-Protected Farmer & FPO Routes */}
          <Route
            path="/farmer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'FPO']}>
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/market-intelligence"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'FPO']}>
                <MarketIntelligencePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/add-produce"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'FPO']}>
                <AddProducePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/produce"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'FPO']}>
                <MyProducePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/demand-forecast"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'FPO']}>
                <MarketIntelligencePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/price-recommendation"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'FPO']}>
                <MarketIntelligencePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/quality"
            element={
              <ProtectedRoute allowedRoles={['FARMER', 'FPO']}>
                <FarmerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Role-Protected FPO Routes */}
          <Route
            path="/fpo/dashboard"
            element={
              <ProtectedRoute allowedRoles={['FPO', 'ADMIN']}>
                <FPODashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fpo/farmers"
            element={
              <ProtectedRoute allowedRoles={['FPO', 'ADMIN']}>
                <FPOFarmersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fpo/produce"
            element={
              <ProtectedRoute allowedRoles={['FPO', 'ADMIN']}>
                <FPOProduceInventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fpo/consumer-orders"
            element={
              <ProtectedRoute allowedRoles={['FPO', 'ADMIN']}>
                <ConsumerOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fpo/bulk-orders"
            element={
              <ProtectedRoute allowedRoles={['FPO', 'ADMIN']}>
                <FPOBulkOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fpo/intelligence"
            element={
              <ProtectedRoute allowedRoles={['FPO', 'ADMIN']}>
                <FPOIntelligencePage />
              </ProtectedRoute>
            }
          />

          {/* Role-Protected Buyer Routes */}
          <Route
            path="/buyer/procurement"
            element={
              <ProtectedRoute allowedRoles={['BULK_BUYER', 'ADMIN']}>
                <BulkBuyerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Role-Protected Logistics Routes */}
          <Route
            path="/logistics/dashboard"
            element={
              <ProtectedRoute allowedRoles={['LOGISTICS', 'ADMIN', 'FPO']}>
                <LogisticsDashboard />
              </ProtectedRoute>
            }
          />

          {/* Role-Protected Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
