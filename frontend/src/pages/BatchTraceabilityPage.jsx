import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import API from '../services/api';
import {
  QrCode,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Calendar,
  User,
  ArrowLeft,
  Sparkles,
  Truck,
  Award,
} from 'lucide-react';

const BatchTraceabilityPage = () => {
  const { batchId } = useParams();
  const targetBatch = batchId || 'KS-BATCH-994821';

  const [batchData, setBatchData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrace = async () => {
      try {
        const { data } = await API.get(`/quality/batch/${targetBatch}`);
        // Fetch produce info
        setBatchData({
          batchId: targetBatch,
          cropName: 'Tomato',
          farmerName: 'Ramesh Kumar',
          location: 'Karnal, Haryana',
          harvestDate: '2026-09-07',
          declaredGrade: 'Grade A',
          aiQualityScore: 94,
          timeline: [
            { stage: 'LISTED', title: 'Farmer Listed Produce', time: '2026-09-02 10:00 AM', actor: 'Ramesh Kumar (Farmer)', location: 'Karnal, HR', notes: 'Listed 2,000 kg Tomato. Declared Grade A.' },
            { stage: 'AI_ASSESSED', title: 'AI Computer Vision Inspection', time: '2026-09-02 10:02 AM', actor: 'KisanSetu AI Vision Engine', location: 'Cloud Microservice', notes: 'Surface defect inspection completed. AI Quality Score: 94/100.' },
            { stage: 'PICKUP_VERIFIED', title: 'Farm-Gate Pickup Verified', time: '2026-09-02 11:30 AM', actor: 'ColdChain Express Logistics', location: 'Karnal Collection Hub', notes: 'Measured weight: 2,000 kg. Confirmed Grade A intact.' },
            { stage: 'IN_TRANSIT', title: 'In Transit via Cold Transport', time: '2026-09-02 01:15 PM', actor: 'HR-05-CC-9988 Truck Driver', location: 'GT Road Highway', notes: 'Refrigerated transit at 4°C.' },
            { stage: 'DELIVERED', title: 'Delivered to Destination DC', time: '2026-09-02 03:45 PM', actor: 'FreshMart DC Warehouse', location: 'Noida, Delhi NCR', notes: 'Order delivered in full.' },
            { stage: 'BUYER_VERIFIED', title: 'Buyer Quality Inspection Verified', time: '2026-09-02 04:00 PM', actor: 'FreshMart Procurement Quality Inspector', location: 'Noida DC', notes: '100% Quality & Weight match confirmed. Escrow payment released.' },
          ],
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrace();
  }, [targetBatch]);

  return (
    <MainLayout>
      <div className="bg-[#F8F9FA] min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Link to="/marketplace" className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-agri-primary">
            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
          </Link>

          {/* Header Card */}
          <div className="bg-gradient-to-r from-agri-dark via-emerald-950 to-slate-950 p-8 rounded-3xl text-white shadow-agri-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-agri-gold" /> Public Batch Traceability Certificate
              </span>
              <span className="font-mono text-xs font-bold text-slate-300">{targetBatch}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold">Batch #{targetBatch}</h1>
                <p className="text-xs text-slate-300 mt-1">Produce: <b>Tomato</b> • Farmer: <b>Ramesh Kumar (Karnal, HR)</b></p>
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/15 text-center">
                <span className="text-[10px] text-slate-300 font-bold block">AI Quality Score</span>
                <span className="text-xl font-black text-agri-light">94 / 100</span>
              </div>
            </div>
          </div>

          {/* Traceability Timeline */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-agri-sm space-y-6">
            <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-agri-primary" /> Lifecycle Verification Timeline
            </h2>

            <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
              {batchData?.timeline.map((event, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-agri-primary border-4 border-white shadow-sm"></div>

                  <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-900">{event.title}</span>
                      <span className="text-[10px] font-mono text-slate-400">{event.time}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 font-medium">Actor: <b>{event.actor}</b> • Location: <b>{event.location}</b></p>
                    <p className="text-xs text-slate-700 pt-1 font-semibold">{event.notes}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BatchTraceabilityPage;
