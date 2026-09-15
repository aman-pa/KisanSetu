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
  Send,
} from 'lucide-react';

const CartCheckoutPage = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, totalProduceCost, totalQuantityKg, maxConsumerLimitKg } = useCart();
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

  const handleSubmitBuyRequest = async (e) => {
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

    setPaymentProcessing(true);
    try {
      const payload = {
        items: cartItems,
        deliveryAddress: { street, city, state, pincode },
      };

      const { data } = await API.post('/orders', payload);

      if (data.success) {
        setOrderSuccess(data.order);
        clearCart();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit buy request.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (orderSuccess) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-md animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Buy Request Submitted to Seller! 📩</h1>
          <p className="text-xs text-slate-600">
            Ticket ID: <span className="font-mono font-bold text-slate-900">{orderSuccess.orderNumber}</span> • Status: <span className="text-amber-700 font-extrabold bg-amber-100 px-2 py-0.5 rounded">Awaiting Seller Acceptance</span>
          </p>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 text-left space-y-4 shadow-sm">
            <div className="flex justify-between text-xs font-bold border-b border-slate-100 pb-3">
              <span>Produce Requested: ₹{orderSuccess.totalProduceCost?.toLocaleString()}</span>
              <span className="text-emerald-800">Grand Total: ₹{orderSuccess.totalAmount?.toLocaleString()}</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Delivery to: {orderSuccess.deliveryAddress?.street}, {orderSuccess.deliveryAddress?.city}, {orderSuccess.deliveryAddress?.state} - {orderSuccess.deliveryAddress?.pincode}
            </p>
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 font-semibold space-y-2">
              <p>ℹ️ The seller has been notified of your request. Once the seller accepts, you can pay &amp; confirm escrow on your Trade Ticket or My Orders dashboard.</p>
              {orderSuccess.buyerRole === 'CONSUMER' && (
                <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] font-bold flex items-start gap-2">
                  <span className="text-base leading-none">⏰</span>
                  <div>
                    <p className="font-extrabold text-blue-900">6-Hour Area Batch Dispatch Active</p>
                    <p className="text-[10px] text-blue-700 font-medium">To protect farmer profit margins and eliminate hourly transport fees, orders in your area are combined into scheduled 6-hour delivery batches.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link
              to={`/ticket/${orderSuccess._id}`}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-agri-dark to-agri-primary text-white text-xs font-black shadow-md hover:shadow-lg transition-all"
            >
              View & Print Official Trade Ticket
            </Link>
            <Link
              to="/consumer/orders"
              className="px-6 py-3 rounded-2xl bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200 transition-all border border-slate-300"
            >
              Go to My Orders
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
                    <div key={item.listingId} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-[#F8F9FA] rounded-2xl border border-slate-100 gap-4">
                      <div className="flex items-center gap-4">
                        {item.image && <img src={item.image} alt={item.cropName} className="w-14 h-14 rounded-xl object-cover" />}
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{item.cropName}</h4>
                          <p className="text-[11px] text-slate-500">Farmer: {item.farmerName} • Grade: {item.grade?.replace('GRADE_', 'Grade ')}</p>
                          <p className="text-xs font-bold text-agri-primary mt-1">
                            ₹{item.pricePerKg}/kg × Subtotal: ₹{(item.quantityKg * item.pricePerKg).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200">
                        {/* Interactive Quantity Control (+ / - / typed input) */}
                        <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                updateQuantity(item.listingId, Math.max(1, item.quantityKg - 1));
                              } catch (err) {
                                setError(err.message);
                              }
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs transition-colors"
                            title="Decrease quantity"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            step="any"
                            value={item.quantityKg}
                            onChange={(e) => {
                              try {
                                const val = Number(e.target.value);
                                if (!isNaN(val)) {
                                  updateQuantity(item.listingId, val);
                                }
                              } catch (err) {
                                setError(err.message);
                              }
                            }}
                            className="w-16 text-center py-1 text-xs font-extrabold text-slate-900 focus:outline-none bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                updateQuantity(item.listingId, item.quantityKg + 1);
                              } catch (err) {
                                setError(err.message);
                              }
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs transition-colors"
                            title="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.listingId)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
                    <div className="space-y-0.5">
                      <div className="flex justify-between items-center">
                        <span>Estimated Cold-Chain Logistics</span>
                        <span className="font-bold text-slate-800">₹{logisticsCost.toLocaleString()}</span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        {user?.role === 'CONSUMER'
                          ? 'Standard retail baseline estimate (₹60)'
                          : 'Commercial freight baseline estimate (5% + ₹500)'}
                      </p>
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
                    onClick={handleSubmitBuyRequest}
                    disabled={paymentProcessing}
                    className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-agri-dark to-agri-primary text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-emerald-300" />
                    <span>{paymentProcessing ? 'Submitting Request...' : 'Send Buy Request to Seller (No Payment Required Now)'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CartCheckoutPage;
