import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import {
  ShoppingCart,
  Trash2,
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Truck,
  Building,
} from 'lucide-react';

const CartCheckoutPage = () => {
  const { cartItems, removeFromCart, clearCart, totalProduceCost, totalQuantityKg, maxConsumerLimitKg } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [street, setStreet] = useState(user?.address?.street || 'Flat 402, Green Acres');
  const [city, setCity] = useState(user?.address?.city || 'Delhi');
  const [state, setState] = useState(user?.address?.state || 'Delhi');
  const [pincode, setPincode] = useState(user?.address?.pincode || '110016');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [error, setError] = useState('');

  const logisticsCost = user?.role === 'CONSUMER' ? 60 : Math.round(totalProduceCost * 0.05 + 500);
  const platformFee = Math.round(totalProduceCost * 0.02);
  const grandTotal = totalProduceCost + logisticsCost + platformFee;

  const handleOpenPayment = (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      setError('Cart is empty.');
      return;
    }

    // Consumer Max Limit Verification
    if (user.role === 'CONSUMER' && totalQuantityKg > maxConsumerLimitKg) {
      setError(`Consumer purchase limit exceeded! You requested ${totalQuantityKg} kg, but max limit is ${maxConsumerLimitKg} kg.`);
      return;
    }

    setIsPaymentModalOpen(true);
  };

  const handleSimulatePayment = async () => {
    setPaymentProcessing(true);
    setError('');
    try {
      const payload = {
        items: cartItems,
        deliveryAddress: { street, city, state, pincode },
      };

      const { data } = await API.post('/orders', payload);

      if (data.success) {
        setOrderSuccess(data.order);
        clearCart();
        setIsPaymentModalOpen(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment processing error.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (orderSuccess) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-agri-md animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Order Confirmed! 🌾</h1>
          <p className="text-xs text-slate-600">
            Order ID: <span className="font-mono font-bold text-slate-800">{orderSuccess.orderNumber}</span> • Payment Secured in Escrow
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 text-left space-y-4 shadow-agri-sm">
            <div className="flex justify-between text-xs font-bold border-b border-slate-100 pb-3">
              <span>Total Produce Amount: ₹{orderSuccess.totalProduceCost.toLocaleString()}</span>
              <span className="text-emerald-800">Grand Total: ₹{orderSuccess.totalAmount.toLocaleString()}</span>
            </div>
            <p className="text-xs text-slate-500">
              Delivery to: {orderSuccess.deliveryAddress.street}, {orderSuccess.deliveryAddress.city}, {orderSuccess.deliveryAddress.state}
            </p>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <Link
              to="/marketplace"
              className="px-6 py-3 rounded-xl bg-agri-primary text-white text-xs font-bold shadow-agri-sm hover:bg-agri-dark transition-all"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-[#F8F9FA] min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Link to="/marketplace" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-agri-primary">
            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
          </Link>

          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-agri-primary" /> Shopping Cart & Checkout
          </h1>

          {error && (
            <div className="p-4 bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-agri-sm">
              <AlertTriangle className="w-5 h-5 text-rose-700 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-4">
              <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">Your cart is empty</h3>
              <Link to="/marketplace" className="inline-block px-6 py-2.5 rounded-xl bg-agri-primary text-white text-xs font-bold">
                Browse Marketplace
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Cart Items List */}
              <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Selected Produce</h2>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.listingId} className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-4">
                        {item.image && <img src={item.image} alt={item.cropName} className="w-14 h-14 rounded-xl object-cover" />}
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{item.cropName}</h4>
                          <p className="text-[11px] text-slate-500">Farmer: {item.farmerName} • Grade: {item.grade}</p>
                          <p className="text-xs font-bold text-agri-primary mt-1">
                            {item.quantityKg} kg × ₹{item.pricePerKg}/kg = ₹{(item.quantityKg * item.pricePerKg).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.listingId)}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery & Order Summary */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-agri-sm space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">Delivery Address</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Street Address"
                      className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-agri-primary focus:outline-none"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      />
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="State"
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      />
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="Pincode"
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs"
                      />
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 pt-2">Order Summary</h3>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Produce Total ({totalQuantityKg} kg)</span>
                      <span className="font-bold text-slate-800">₹{totalProduceCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cold-Chain Logistics</span>
                      <span className="font-bold text-slate-800">₹{logisticsCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform Fee (2%)</span>
                      <span className="font-bold text-slate-800">₹{platformFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-3 text-sm font-black text-slate-900">
                      <span>Grand Total</span>
                      <span className="text-agri-primary">₹{grandTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleOpenPayment}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-agri-dark to-agri-primary text-white font-bold text-xs shadow-agri-md hover:shadow-agri-lg transition-all flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" /> Pay & Confirm Order
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SIMULATED PAYMENT MODAL */}
          {isPaymentModalOpen && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" /> KisanSetu Escrow Payment Gateway
                  </span>
                  <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 font-bold hover:text-slate-600">✕</button>
                </div>

                <div className="p-4 bg-[#F8F9FA] rounded-2xl space-y-2 text-center">
                  <p className="text-xs text-slate-500">Simulated Payment Amount</p>
                  <p className="text-3xl font-black text-agri-primary">₹{grandTotal.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">SIH Demo Simulation Mode • Escrow Secured</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Select Payment Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" className="p-3 rounded-xl border-2 border-agri-primary bg-emerald-50 text-xs font-bold text-agri-primary text-left">
                      📱 UPI / QR Code
                    </button>
                    <button type="button" className="p-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 text-left">
                      💳 Net Banking
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSimulatePayment}
                  disabled={paymentProcessing}
                  className="w-full py-3.5 rounded-xl bg-agri-dark text-white font-bold text-xs shadow-agri-md hover:bg-agri-primary transition-all"
                >
                  {paymentProcessing ? 'Processing Escrow Payment...' : 'Complete Simulated Payment'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CartCheckoutPage;
