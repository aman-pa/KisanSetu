import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  Printer,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Package,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  QrCode,
  IndianRupee,
  Building2,
  Sprout,
  Send,
  CreditCard,
  XCircle,
} from 'lucide-react';

const TradeTicketPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Payment Modal State for Consumer
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const fetchTicketDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await API.get(`/orders/${id}`);
      if (data.success) {
        setOrder(data.order);
      } else {
        setError(data.message || 'Failed to load trade ticket details.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch trade ticket.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  // Seller Action: Accept or Decline Request
  const handleSellerStatusChange = async (newStatus) => {
    setActionLoading(true);
    setSuccessMsg('');
    setError('');
    try {
      const { data } = await API.put(`/orders/${id}/status`, { status: newStatus });
      if (data.success) {
        setOrder(data.order);
        setSuccessMsg(
          newStatus === 'ACCEPTED'
            ? 'Buy Request accepted! The buyer has been notified to proceed with payment.'
            : 'Order request declined and produce stock restored.'
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Consumer Action: Pay Escrow & Confirm Order
  const handlePayEscrow = async () => {
    setPaymentProcessing(true);
    setError('');
    setSuccessMsg('');
    try {
      const { data } = await API.put(`/orders/${id}/pay`);
      if (data.success) {
        setOrder(data.order);
        setIsPaymentModalOpen(false);
        setSuccessMsg('Payment confirmed & secured in KisanSetu Escrow! Order is now in transit.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment processing error.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="py-20 text-center text-xs font-bold text-slate-500 flex items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin" />
          <span>Generating Trade Ticket details...</span>
        </div>
      </MainLayout>
    );
  }

  if (error || !order) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-600 mx-auto" />
          <h2 className="text-lg font-black text-slate-900">Trade Ticket Not Found</h2>
          <p className="text-xs text-slate-500">{error || 'Could not locate the requested trade ticket.'}</p>
          <Link
            to="/marketplace"
            className="inline-block px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold"
          >
            Back to Marketplace
          </Link>
        </div>
      </MainLayout>
    );
  }

  const isSeller = user && order.items?.some((i) => (i.farmer?._id || i.farmer) === user._id);
  const isBuyer = user && (order.buyer?._id || order.buyer) === user._id;

  const ticketId = order.orderNumber;
  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <MainLayout>
      {/* Printable CSS Optimization */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-ticket, #printable-ticket * {
            visibility: visible;
          }
          #printable-ticket {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="min-h-screen py-8 bg-slate-50/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Top Bar Navigation & Actions */}
          <div className="flex items-center justify-between no-print">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-all"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Print Official Ticket / Save PDF</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          {successMsg && (
            <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-sm no-print">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {error && (
            <div className="p-4 bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-sm no-print">
              <AlertCircle className="w-5 h-5 text-rose-700 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* =========================================================================
              MAIN TRADE TICKET (PRINTABLE CONTAINER)
             ========================================================================= */}
          <div
            id="printable-ticket"
            className="bg-white rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden space-y-8 p-6 sm:p-10"
          >
            {/* Header Branding & Ticket ID */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-emerald-900/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-agri-dark via-agri-primary to-agri-accent text-white flex items-center justify-center font-bold shadow-md">
                  <Sprout className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-xl font-black bg-gradient-to-r from-agri-dark to-agri-primary bg-clip-text text-transparent">
                    KisanSetu <span className="text-amber-500 font-extrabold">Trade Ticket</span>
                  </h1>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">
                    Official Agricultural Produce Contract
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 text-emerald-300 font-mono text-xs font-black">
                  <QrCode className="w-3.5 h-3.5 text-amber-400" /> Ticket ID: {ticketId}
                </div>
                <p className="text-[11px] text-slate-500 font-semibold">Generated: {formattedDate}</p>
              </div>
            </div>

            {/* Workflow Status Banner */}
            <div className="p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-emerald-50/70 border-emerald-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase text-emerald-950">
                    Trade Status: <span className="text-emerald-700">{order.status}</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 font-medium">
                    Payment Escrow Status: <b>{order.paymentStatus}</b>
                  </p>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="no-print">
                {/* 1. SELLER ACTION: Accept or Decline Request */}
                {isSeller && order.status === 'PENDING' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSellerStatusChange('ACCEPTED')}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Accept Buy Request
                    </button>
                    <button
                      onClick={() => handleSellerStatusChange('CANCELLED')}
                      disabled={actionLoading}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" /> Decline Request
                    </button>
                  </div>
                )}

                {/* 2. BUYER ACTION: Pay Escrow if Seller Accepted */}
                {isBuyer && order.status === 'ACCEPTED' && (
                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-agri-dark to-agri-primary text-white text-xs font-black shadow-md flex items-center gap-2 cursor-pointer animate-pulse"
                  >
                    <CreditCard className="w-4 h-4 text-emerald-300" /> Pay & Confirm Escrow (₹{order.totalAmount?.toLocaleString()})
                  </button>
                )}

                {/* Status Messages */}
                {isBuyer && order.status === 'PENDING' && (
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Buy Request Sent. Waiting for Seller to accept.
                  </span>
                )}
              </div>
            </div>

            {/* Buyer vs Seller Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* BUYER DETAILS CARD */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-700" /> Buyer / Consumer Details
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                    {order.buyerRole || 'CONSUMER'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Registered Name:</span>
                    <span className="font-extrabold text-slate-900">{order.buyer?.name || 'Consumer User'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold flex items-center gap-1">
                      <Phone className="w-3 h-3 text-emerald-600" /> Mobile Phone:
                    </span>
                    <a href={`tel:${order.buyer?.phone}`} className="font-bold text-emerald-800 hover:underline">
                      {order.buyer?.phone || 'Not Provided'}
                    </a>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold flex items-center gap-1">
                      <Mail className="w-3 h-3 text-emerald-600" /> Email Address:
                    </span>
                    <span className="font-bold text-slate-800">{order.buyer?.email || 'Not Provided'}</span>
                  </div>

                  <div className="pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500 font-semibold flex items-center gap-1 mb-1">
                      <MapPin className="w-3 h-3 text-rose-500" /> Delivery Address:
                    </span>
                    <p className="font-extrabold text-slate-900 bg-white p-2 rounded-xl border border-slate-200">
                      {order.deliveryAddress
                        ? `${order.deliveryAddress.street || ''}, ${order.deliveryAddress.city || ''}, ${order.deliveryAddress.state || ''} - ${order.deliveryAddress.pincode || ''}`
                        : 'Registered Buyer Address'}
                    </p>
                  </div>
                </div>
              </div>

              {/* SELLER / FARMER DETAILS CARD */}
              <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                    <Sprout className="w-4 h-4 text-emerald-700" /> Seller / Farmer Details
                  </span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-900">
                    Producer
                  </span>
                </div>

                {order.items?.[0]?.farmer ? (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold">Farmer Name:</span>
                      <span className="font-extrabold text-slate-900">{order.items[0].farmer.name || 'Verified Farmer'}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-600" /> Registered Phone:
                      </span>
                      <a href={`tel:${order.items[0].farmer.phone}`} className="font-bold text-emerald-800 hover:underline">
                        {order.items[0].farmer.phone || 'Not Provided'}
                      </a>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Mail className="w-3 h-3 text-emerald-600" /> Email:
                      </span>
                      <span className="font-bold text-slate-800">{order.items[0].farmer.email || 'Verified Partner'}</span>
                    </div>

                    <div className="pt-1 border-t border-emerald-200/60">
                      <span className="text-slate-500 font-semibold flex items-center gap-1 mb-1">
                        <MapPin className="w-3 h-3 text-rose-500" /> Farm Location:
                      </span>
                      <p className="font-extrabold text-slate-900 bg-white p-2 rounded-xl border border-emerald-200">
                        {order.items[0].farmer.address?.city || 'Karnal'}, {order.items[0].farmer.address?.state || 'Haryana'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 font-medium italic">Verified KisanSetu Partner Producer</p>
                )}
              </div>
            </div>

            {/* Produce Items Purchased Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Produce Order Specifications</h3>
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-extrabold uppercase text-[11px]">
                    <tr>
                      <th className="p-3">Crop Name</th>
                      <th className="p-3">Grade</th>
                      <th className="p-3 text-right">Quantity (kg)</th>
                      <th className="p-3 text-right">Price per kg</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                    {order.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-extrabold text-slate-900">{item.cropName}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-300">
                            {item.listing?.grade?.replace('GRADE_', 'Grade ') || 'Grade A'}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold">{item.quantityKg?.toLocaleString()} kg</td>
                        <td className="p-3 text-right">₹{item.pricePerKg}/kg</td>
                        <td className="p-3 text-right font-black text-slate-900">₹{item.subtotal?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="flex justify-end pt-2">
              <div className="w-full sm:w-80 bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Produce Subtotal:</span>
                  <span className="font-bold text-slate-900">₹{order.totalProduceCost?.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Logistics Baseline:</span>
                  <span className="font-bold text-slate-900">₹{order.logisticsCost?.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-slate-600">
                  <span>Platform Fee (2%):</span>
                  <span className="font-bold text-slate-900">₹{order.platformFee?.toLocaleString()}</span>
                </div>

                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black text-slate-900">
                  <span>Grand Total Amount:</span>
                  <span className="text-emerald-700">₹{order.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Footer Authorization Stamp */}
            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Digitally Verified Agricultural Trade Contract • KisanSetu AI Network</span>
              </div>
              <p className="font-mono text-slate-400">Ticket Hash: {order._id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CONSUMER ESCROW PAYMENT MODAL
         ========================================================================= */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 no-print animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" /> KisanSetu Escrow Payment Gateway
              </span>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 font-bold hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl space-y-2 text-center border border-slate-200">
              <p className="text-xs text-slate-500 font-semibold">Total Escrow Amount Due</p>
              <p className="text-3xl font-black text-emerald-700">₹{order.totalAmount?.toLocaleString()}</p>
              <p className="text-[10px] text-slate-400">
                Payment is held in KisanSetu Escrow and released to Farmer upon verified delivery.
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Select Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="p-3 rounded-xl border-2 border-emerald-600 bg-emerald-50 text-xs font-bold text-emerald-900 text-left"
                >
                  📱 UPI / QR Code
                </button>
                <button
                  type="button"
                  className="p-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 text-left"
                >
                  💳 Net Banking / Card
                </button>
              </div>
            </div>

            <button
              onClick={handlePayEscrow}
              disabled={paymentProcessing}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-agri-dark to-agri-primary text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              {paymentProcessing ? 'Securing Escrow Payment...' : 'Confirm & Pay Escrow'}
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default TradeTicketPage;
