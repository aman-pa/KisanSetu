import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, GitFork, Users, Phone, Truck } from 'lucide-react';

// Route color palette for 1 to 5+ delivery boys
const ROUTE_COLOR_PALETTE = [
  '#059669', // Emerald Green (Rider 1)
  '#6366f1', // Indigo / Purple (Rider 2)
  '#f59e0b', // Amber / Orange (Rider 3)
  '#e11d48', // Rose / Crimson (Rider 4)
  '#0891b2', // Cyan / Teal (Rider 5)
  '#8b5cf6', // Violet
  '#0284c7', // Sky Blue
];

// Custom SVG HTML Icons for Leaflet Markers
const createCustomIcon = (type, label = '', customBg = null, customBorder = null) => {
  let bgColor = customBg || '#10b981';
  let iconSvg = '🌱';
  let borderColor = customBorder || '#059669';

  if (type === 'COLLECTION_HUB') {
    bgColor = '#0f172a'; // Slate-900 for Hub
    iconSvg = '🏢';
    borderColor = '#334155';
  } else if (type === 'BUYER_DROP') {
    iconSvg = '📍';
  } else if (type === 'RIDER_LIVE') {
    iconSvg = '🛵';
  }

  const html = `
    <div style="
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: ${bgColor};
      border: 3px solid #ffffff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.35);
      color: #ffffff;
      font-size: 14px;
      font-weight: 800;
    ">
      <span>${iconSvg}</span>
      ${label ? `<span style="position: absolute; top: -8px; right: -8px; background: #0f172a; color: #fff; font-size: 9px; font-weight: 900; padding: 2px 5px; border-radius: 9999px; border: 2px solid #fff; white-space: nowrap;">${label}</span>` : ''}
      <div style="
        position: absolute;
        bottom: -6px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid ${borderColor};
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
  });
};

const DEFAULT_WAYPOINTS = [
  {
    type: 'COLLECTION_HUB',
    name: 'Kheri FPO Central Aggregation Hub',
    location: { lat: 29.6857, lng: 76.9905 },
    address: 'Kheri FPO Hub, Karnal, Haryana',
    crop: 'Consolidated Consumer Pool (35 kg)',
    status: 'ORIGIN_DISPATCH',
  },
  {
    type: 'BUYER_DROP',
    name: 'Anita Verma (Sector 14 - North)',
    location: { lat: 29.6920, lng: 76.9810 },
    address: 'House #402, Sector 14, Karnal',
    crop: 'Fresh Tomato (3 kg), Potato (5 kg)',
    weightKg: 8,
    bearing: '025° NNE',
    distanceKm: 4.2,
    status: 'DOORSTEP_DELIVERY',
  },
  {
    type: 'BUYER_DROP',
    name: 'Sunita Sharma (Urban Estate - North-East)',
    location: { lat: 29.7150, lng: 77.0350 },
    address: 'Plot 12, Urban Estate, Karnal',
    crop: 'Wheat (10 kg), Tomato (2 kg)',
    weightKg: 12,
    bearing: '048° NE',
    distanceKm: 13.8,
    status: 'DOORSTEP_DELIVERY',
  },
  {
    type: 'BUYER_DROP',
    name: 'Rajesh Gupta (Model Town - South-East)',
    location: { lat: 29.6780, lng: 77.0120 },
    address: 'Street 4, Model Town, Karnal',
    crop: 'Spinach (2 kg), Onion (4 kg)',
    weightKg: 6,
    bearing: '135° SE',
    distanceKm: 8.5,
    status: 'DOORSTEP_DELIVERY',
  },
  {
    type: 'BUYER_DROP',
    name: 'Deepak Malik (G.T. Road - South-West)',
    location: { lat: 29.6420, lng: 76.9450 },
    address: 'G.T. Road Enclave, Karnal',
    crop: 'Potato (5 kg), Tomato (4 kg)',
    weightKg: 9,
    bearing: '210° SSW',
    distanceKm: 18.4,
    status: 'DOORSTEP_DELIVERY',
  },
];

const LogisticsRouteMap = ({
  routes = null,
  waypoints = DEFAULT_WAYPOINTS,
  splitRoutes = null,
  isSplitMode = true,
  activeVehicleLocation = null,
}) => {
  // Normalize routes into a clean array of route objects
  const activeRoutes = useMemo(() => {
    if (routes && Array.isArray(routes) && routes.length > 0) {
      return routes;
    }

    if (splitRoutes?.clusterA && splitRoutes?.clusterB) {
      return [
        {
          routeId: 'route_cluster_a',
          routeIndex: 1,
          routeName: 'Route 1: North-East Shuttles',
          zone: 'North Sector',
          color: '#059669',
          rider: { name: 'Vikram Rawat', vehicleNo: 'HR-05-CC-5521', phone: '+91 97234 11223' },
          waypoints: splitRoutes.clusterA,
        },
        {
          routeId: 'route_cluster_b',
          routeIndex: 2,
          routeName: 'Route 2: South-West Shuttles',
          zone: 'South Sector',
          color: '#6366f1',
          rider: { name: 'Rohan Verma', vehicleNo: 'HR-05-EV-3310', phone: '+91 98111 22334' },
          waypoints: splitRoutes.clusterB,
        },
      ];
    }

    // Default single route
    return [
      {
        routeId: 'route_single',
        routeIndex: 1,
        routeName: 'Single Combined Loop',
        zone: 'All Sectors',
        color: '#d97706',
        rider: { name: 'Vikram Rawat', vehicleNo: 'HR-05-CC-5521', phone: '+91 97234 11223' },
        waypoints: waypoints || DEFAULT_WAYPOINTS,
      },
    ];
  }, [routes, splitRoutes, waypoints]);

  // Collect all points across all routes for map centering
  const allPoints = useMemo(() => {
    const pts = [];
    activeRoutes.forEach((r) => {
      (r.waypoints || []).forEach((wp) => {
        if (wp.location?.lat && wp.location?.lng) {
          pts.push(wp);
        }
      });
    });
    return pts.length > 0 ? pts : DEFAULT_WAYPOINTS;
  }, [activeRoutes]);

  // Calculate center of all visible points
  const mapCenter = useMemo(() => {
    if (allPoints.length === 0) return [29.6857, 76.9905];
    const avgLat = allPoints.reduce((s, p) => s + p.location.lat, 0) / allPoints.length;
    const avgLng = allPoints.reduce((s, p) => s + p.location.lng, 0) / allPoints.length;
    return [avgLat, avgLng];
  }, [allPoints]);

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] rounded-3xl overflow-hidden border border-slate-200/80 shadow-md bg-slate-100">
      <MapContainer
        center={mapCenter}
        zoom={11}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* 1. Dynamic Polylines for each active Delivery Boy Route */}
        {activeRoutes.map((r, rIdx) => {
          const polylinePositions = (r.waypoints || [])
            .filter((wp) => wp.location?.lat && wp.location?.lng)
            .map((wp) => [wp.location.lat, wp.location.lng]);

          if (polylinePositions.length < 2) return null;

          const routeColor = r.color || ROUTE_COLOR_PALETTE[rIdx % ROUTE_COLOR_PALETTE.length];

          return (
            <Polyline
              key={`polyline-${r.routeId || rIdx}`}
              positions={polylinePositions}
              pathOptions={{
                color: routeColor,
                weight: 5,
                opacity: 0.9,
                dashArray: '6, 6',
                lineCap: 'round',
              }}
            />
          );
        })}

        {/* 2. Central Aggregation Origin Hub Marker */}
        {allPoints.length > 0 && allPoints[0] && (
          <Marker
            position={[allPoints[0].location.lat, allPoints[0].location.lng]}
            icon={createCustomIcon('COLLECTION_HUB', 'HUB', '#0f172a', '#334155')}
          >
            <Tooltip direction="top" offset={[0, -20]} opacity={0.95}>
              <div className="text-xs font-black font-sans text-slate-900">
                🏢 KisanSetu Central FPO Aggregation Hub (Origin 0 km)
              </div>
            </Tooltip>
            <Popup>
              <div className="p-1 font-sans text-xs space-y-1 min-w-[190px]">
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-900 text-white">
                  🏢 Origin Dispatch Hub
                </span>
                <p className="font-bold text-slate-900">{allPoints[0].name}</p>
                <p className="text-[11px] text-slate-500">{allPoints[0].address}</p>
                <p className="text-[11px] text-emerald-700 font-bold">Consolidated Dispatch Pool: 35 kg</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* 3. Render Drop Markers for each Route */}
        {activeRoutes.map((r, rIdx) => {
          const routeColor = r.color || ROUTE_COLOR_PALETTE[rIdx % ROUTE_COLOR_PALETTE.length];
          const drops = (r.waypoints || []).slice(1); // Exclude hub origin

          return drops.map((wp, dIdx) => {
            if (!wp.location?.lat || !wp.location?.lng) return null;

            const icon = createCustomIcon(
              'BUYER_DROP',
              `R${rIdx + 1} • #${dIdx + 1}`,
              routeColor,
              routeColor
            );

            return (
              <Marker
                key={`marker-${r.routeId || rIdx}-${dIdx}`}
                position={[wp.location.lat, wp.location.lng]}
                icon={icon}
              >
                <Tooltip direction="top" offset={[0, -20]} opacity={0.95}>
                  <div className="text-xs font-bold font-sans">
                    <span className="text-slate-900 block">{wp.name}</span>
                    <span className="text-[11px] font-mono font-bold" style={{ color: routeColor }}>
                      Rider {rIdx + 1} ({r.rider?.name || 'Assigned'}) • {wp.bearing || 'Drop'}
                    </span>
                  </div>
                </Tooltip>

                <Popup>
                  <div className="p-1 space-y-1.5 font-sans min-w-[200px]">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-[10px] font-black px-2 py-0.5 rounded text-white"
                        style={{ backgroundColor: routeColor }}
                      >
                        ⚡ Delivery Rider {rIdx + 1}
                      </span>
                      {wp.bearing && <span className="text-[10px] font-mono text-slate-500">{wp.bearing}</span>}
                    </div>
                    <p className="text-xs font-bold text-slate-900">{wp.name}</p>
                    <p className="text-[11px] text-slate-500">{wp.address}</p>
                    {wp.crop && <p className="text-[11px] font-bold text-emerald-700">{wp.crop}</p>}
                    <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-slate-600">Rider: <b>{r.rider?.name || 'Vikram'}</b></span>
                      <span className="font-mono text-slate-500">{r.rider?.phone || ''}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          });
        })}
      </MapContainer>

      {/* Map Overlay Badge & Multi-Rider Legend */}
      <div className="absolute top-4 right-4 z-[400] bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-200/80 shadow-lg text-xs font-sans space-y-2 pointer-events-auto max-w-[300px]">
        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
          <div className="flex items-center gap-1.5 font-black text-slate-900">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI Fleet Allocation Map</span>
          </div>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
            {activeRoutes.length} Delivery {activeRoutes.length === 1 ? 'Boy' : 'Boys'}
          </span>
        </div>

        <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
          {activeRoutes.map((r, idx) => {
            const routeColor = r.color || ROUTE_COLOR_PALETTE[idx % ROUTE_COLOR_PALETTE.length];
            const dropsCount = Math.max(0, (r.waypoints || []).length - 1);

            return (
              <div
                key={`legend-${idx}`}
                className="flex items-center justify-between p-1.5 rounded-xl border border-slate-100 text-[11px]"
                style={{ backgroundColor: `${routeColor}10` }}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: routeColor }}
                  />
                  <div className="min-w-0 truncate">
                    <b className="text-slate-900 block truncate">
                      Rider {idx + 1}: {r.rider?.name || `Delivery Boy ${idx + 1}`}
                    </b>
                    <span className="text-[10px] text-slate-500 block truncate">{r.zone || r.routeName}</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-800 flex-shrink-0">
                  {dropsCount} drops
                </span>
              </div>
            );
          })}
        </div>

        <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-900 inline-block" /> FPO Hub
          </span>
          <span className="font-semibold text-emerald-700">Multi-Rider Parallel Run</span>
        </div>
      </div>
    </div>
  );
};

export default LogisticsRouteMap;

