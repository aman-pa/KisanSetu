import React from 'react';
import {
  Truck,
  CheckCircle2,
  X,
  Phone,
  Compass,
  PackageCheck,
  Zap,
  ArrowRight,
  ShieldCheck,
  Clock,
  MapPin,
  ExternalLink,
  DollarSign,
  Layers,
} from 'lucide-react';

const LogisticsDispatchModal = ({
  isOpen,
  onClose,
  dispatchInfo,
  onViewMap,
  onViewShipments,
}) => {
  if (!isOpen || !dispatchInfo) return null;

  const {
    batchId = 'BATCH-20KM-8821',
    timestamp = 'Just now',
    fleetCount = 2,
    costRs = 210,
    profitRs = 470,
    savingsPct = 69.1,
    roster = [],
  } = dispatchInfo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 border-b border-slate-100 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-lg shadow-emerald-600/20 flex-shrink-0 animate-pulse">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900">
                🚀 AI Fleet Dispatched Successfully!
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                LIVE ON ROUTE
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Batch <span className="font-mono text-emerald-800 font-bold">#{batchId}</span> • Dispatched at {timestamp} from <b className="text-slate-700">Karnal FPO Central Hub</b>
            </p>
          </div>
        </div>

        {/* Batch Efficiency & Cost Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 text-center">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Active Fleet</span>
            <b className="text-base font-black text-emerald-900">{fleetCount} Delivery Personnel</b>
            <span className="text-[10px] text-emerald-700 font-semibold block">Directional Shuttles</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase block">Logistics Cost</span>
            <b className="text-base font-black text-slate-900 font-mono">₹{costRs}</b>
            <span className="text-[10px] text-emerald-700 font-bold block">Lowest Cost ($k^*$)</span>
          </div>
          <div className="p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 text-center">
            <span className="text-[10px] font-bold text-emerald-800 uppercase block">Net Margin</span>
            <b className="text-base font-black text-emerald-900 font-mono">₹{profitRs}</b>
            <span className="text-[10px] text-emerald-700 font-semibold block">+{savingsPct}% Profit</span>
          </div>
        </div>

        {/* Dispatched Delivery Boys Cards */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-black text-slate-900 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-emerald-700" />
              Active En-Route Riders ({roster.length}):
            </span>
            <span className="text-[10px] font-bold text-slate-400 normal-case">GPS Telemetry Transmitting</span>
          </div>

          <div className="space-y-3">
            {roster.map((rider, idx) => (
              <div
                key={rider.riderId || idx}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5 relative overflow-hidden"
                style={{ borderLeft: `5px solid ${rider.color || '#059669'}` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-xs"
                      style={{ backgroundColor: rider.color || '#059669' }}
                    >
                      R{idx + 1}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 text-xs sm:text-sm">{rider.name}</h4>
                      <p className="text-[11px] text-slate-500 font-semibold">
                        {rider.roleTitle || 'Sector Lead'} • <span className="font-mono font-bold text-slate-800">{rider.vehicleNo}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      In Transit
                    </span>
                    <p className="text-[10px] font-mono text-slate-500 mt-0.5">{rider.phone}</p>
                  </div>
                </div>

                {/* Stops Brief */}
                {rider.stops && rider.stops.length > 0 && (
                  <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-100 space-y-1 text-xs">
                    <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-500">
                      <span>Assigned Sector Drops ({rider.stops.length}):</span>
                      <span className="text-emerald-800 font-mono">{rider.totalKg || 15} kg payload</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {rider.stops.map((s, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-800"
                        >
                          #{sIdx + 1} {s.name.split(':')[1] || s.name} ({s.distanceKm}km)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
          >
            Close & Continue
          </button>

          <div className="flex items-center gap-2">
            {onViewShipments && (
              <button
                onClick={() => {
                  onViewShipments();
                  onClose();
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <PackageCheck className="w-4 h-4 text-slate-600" />
                View Dispatches Queue
              </button>
            )}

            {onViewMap && (
              <button
                onClick={() => {
                  onViewMap();
                  onClose();
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Compass className="w-4 h-4 text-emerald-200" />
                Track Live on GPS Map
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogisticsDispatchModal;
