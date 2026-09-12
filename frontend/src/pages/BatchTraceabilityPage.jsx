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
  AlertTriangle,
  Package,
  Layers,
} from 'lucide-react';

const BatchTraceabilityPage = () => {
  const { batchId } = useParams();
  const targetBatch = batchId || 'KS-BATCH-994821';

  const [batchData, setBatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');
    setBatchData(null); // Prevent stale data on route change

    const fetchTrace = async () => {
      try {
        const { data } = await API.get(`/quality/batch/${targetBatch}`);
        if (isMounted) {
          if (data.success && data.batchData) {
            setBatchData(data.batchData);
          } else {
            setError(`Traceability record for batch #${targetBatch} could not be found.`);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error('Batch trace fetch error:', err);
          setError(
            err.response?.data?.message ||
              `Traceability record for batch #${targetBatch} could not be found.`
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTrace();

    return () => {
      isMounted = false;
    };
  }, [targetBatch]);

  return (
    <MainLayout>
      <div className="bg-[#F8F9FA] min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-agri-primary"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
          </Link>

          {loading ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-agri-sm space-y-4 animate-pulse">
              <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <h3 className="text-base font-bold text-slate-800">
                Verifying Batch Certificate #{targetBatch}...
              </h3>
              <p className="text-xs text-slate-500">
                Fetching origin farm provenance and lifecycle verification timeline.
              </p>
            </div>
          ) : error || !batchData ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-rose-100 shadow-agri-sm space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">Batch Not Found</h2>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                {error || `The requested produce batch #${targetBatch} does not exist in the KisanSetu traceability registry.`}
              </p>
              <div className="pt-2">
                <Link
                  to="/marketplace"
                  className="inline-block px-6 py-2.5 rounded-xl bg-agri-primary text-white text-xs font-bold shadow-sm hover:bg-agri-dark transition-all"
                >
                  Browse Verified Marketplace Produce
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Header Card */}
              <div className="bg-gradient-to-r from-agri-dark via-emerald-950 to-slate-950 p-8 rounded-3xl text-white shadow-agri-md space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center gap-1.5 border border-emerald-500/30">
                    <ShieldCheck className="w-4 h-4 text-agri-gold" /> Public Batch Traceability Certificate
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-300 bg-white/10 px-3 py-1 rounded-xl">
                    {batchData.batchId}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-extrabold">Batch #{batchData.batchId}</h1>
                    <p className="text-xs text-slate-300 mt-1">
                      Produce: <b className="text-white">{batchData.cropName}</b> • Farmer:{' '}
                      <b className="text-white">{batchData.farmerName}</b> ({batchData.location})
                    </p>
                    <p className="text-[11px] text-emerald-300 mt-0.5 font-medium">
                      Declared Grade: <b>{batchData.declaredGrade}</b> • Total Harvest Lot:{' '}
                      <b>{batchData.quantityKg ? batchData.quantityKg.toLocaleString() : 0} kg</b>
                    </p>
                  </div>
                  <div className="bg-white/10 px-5 py-3 rounded-2xl border border-white/15 text-center flex-shrink-0">
                    <span className="text-[10px] text-slate-300 font-bold block">AI Quality Score</span>
                    <span className="text-2xl font-black text-agri-light">
                      {batchData.aiQualityScore} <span className="text-xs text-slate-300 font-normal">/ 100</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Batch Metadata Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Farm Origin</span>
                    <span className="text-xs font-bold text-slate-800">{batchData.location}</span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Harvest Date</span>
                    <span className="text-xs font-bold text-slate-800">
                      {batchData.harvestDate ? new Date(batchData.harvestDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Grade Verification</span>
                    <span className="text-xs font-bold text-slate-800">{batchData.declaredGrade}</span>
                  </div>
                </div>
              </div>

              {/* Traceability Timeline */}
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-agri-sm space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-agri-primary" /> Lifecycle Verification Timeline
                  </h2>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    {batchData.timeline?.length || 0} Verified Events
                  </span>
                </div>

                <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200">
                  {batchData.timeline && batchData.timeline.map((event, idx) => (
                    <div key={idx} className="relative group">
                      <div className="absolute -left-6 top-0 w-4 h-4 rounded-full bg-agri-primary border-4 border-white shadow-sm"></div>

                      <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-slate-900">{event.title}</span>
                          <span className="text-[10px] font-mono text-slate-400">{event.time}</span>
                        </div>

                        <p className="text-[11px] text-slate-500 font-medium">
                          Actor: <b>{event.actor}</b> • Location: <b>{event.location}</b>
                        </p>
                        <p className="text-xs text-slate-700 pt-1 font-semibold">{event.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default BatchTraceabilityPage;
