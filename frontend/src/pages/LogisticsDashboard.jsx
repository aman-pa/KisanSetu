import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import LogisticsRouteMap from '../components/LogisticsRouteMap';
import LogisticsQRScannerModal from '../components/LogisticsQRScannerModal';
import LogisticsVehicleAssignModal from '../components/LogisticsVehicleAssignModal';
import LogisticsDispatchModal from '../components/LogisticsDispatchModal';
import API from '../services/api';
import {
  Truck,
  MapPin,
  CheckCircle2,
  Navigation,
  ShieldCheck,
  Clock,
  Sparkles,
  Building2,
  UserCheck,
  RefreshCw,
  Phone,
  PackageCheck,
  TrendingUp,
  AlertTriangle,
  Compass,
  QrCode,
  Thermometer,
  Layers,
  Search,
  Filter,
  CheckSquare,
  ArrowRight,
  Droplets,
  Activity,
  Users,
  Timer,
  Zap,
  ChevronRight,
  ExternalLink,
  Package,
  Radio,
  Sliders,
  Battery,
  Flame,
  AlertCircle,
  Play,
  Pause,
  GitFork,
  Target,
  DollarSign,
  Scale,
  CircleDot,
} from 'lucide-react';

// Isolated Demo Data for Offline / Fallback verification
const DEMO_PICKUP_REQUESTS = [
  {
    _id: 'ord_demo_bulk_1',
    orderNumber: 'ORD-8921',
    createdAt: '2026-09-14T08:30:00.000Z',
    cropName: 'Organic Tomato (Bulk Grade A)',
    quantityKg: 2000,
    totalOrderKg: 2000,
    farmerName: 'Baldev Singh (Karnal Farmer)',
    farmerLocation: 'Karnal FPO Center, Haryana',
    buyerName: 'FreshMart Supermarket DC',
    buyerOrg: 'FreshMart Regional Distribution Hub',
    buyerRole: 'BULK_BUYER',
    isConsumer: false,
    dispatchModel: 'DIRECT_DEDICATED_FREIGHT',
    deliveryCity: 'Sector 62, Noida',
    deliveryState: 'Delhi NCR',
    deliveryAddress: { street: 'DC Gateway 4, Sector 62', city: 'Noida', state: 'Delhi NCR', pincode: '201301' },
    totalAmount: 56000,
    status: 'ACCEPTED',
    vehicleAssigned: 'HR-05-CC-9988',
    storageSpec: 'Refrigerated 8-Ton Truck (2°C - 6°C)',
    distanceToPickupKm: 12.4,
    locationMatch: 'LOCAL_RADIUS',
    capacityStatus: 'FITS_CAPACITY',
  },
  {
    _id: 'ord_demo_bulk_2',
    orderNumber: 'ORD-8922',
    createdAt: '2026-09-14T09:15:00.000Z',
    cropName: 'Potato Grade A (Bulk Sacks)',
    quantityKg: 1500,
    totalOrderKg: 1500,
    farmerName: 'Suresh Singh (Samalkha Farmer)',
    farmerLocation: 'Samalkha FPO Hub, Panipat',
    buyerName: 'Mother Dairy Central Hub',
    buyerOrg: 'Mother Dairy Cold Storage Terminal',
    buyerRole: 'BULK_BUYER',
    isConsumer: false,
    dispatchModel: 'DIRECT_DEDICATED_FREIGHT',
    deliveryCity: 'Mangolpuri',
    deliveryState: 'Delhi NCR',
    deliveryAddress: { street: 'Terminal Block 9, Mangolpuri', city: 'Delhi', state: 'Delhi NCR', pincode: '110083' },
    totalAmount: 28500,
    status: 'ACCEPTED',
    vehicleAssigned: 'HR-05-CC-7712',
    storageSpec: 'Insulated Bulk Carrier (10°C - 15°C)',
    distanceToPickupKm: 28.1,
    locationMatch: 'REGIONAL_ROUTE',
    capacityStatus: 'FITS_CAPACITY',
  },
  {
    _id: 'ord_demo_cons_1',
    orderNumber: 'ORD-C-101',
    createdAt: new Date(Date.now() - 4.2 * 3600 * 1000).toISOString(),
    cropName: 'Fresh Organic Veggie Box (Tomato + Potato)',
    quantityKg: 8,
    totalOrderKg: 8,
    farmerName: 'Kheri FPO Member Cluster',
    farmerLocation: 'Karnal FPO Center (10-20km Hub)',
    buyerName: 'Anita Verma',
    buyerOrg: 'House #402, Sector 14',
    buyerRole: 'CONSUMER',
    isConsumer: true,
    dispatchModel: 'AREA_BATCHED_20KM',
    fpoRadiusKm: 4.2,
    deliveryCity: 'Sector 14',
    deliveryState: 'Karnal',
    deliveryAddress: { street: 'House #402, Sector 14', city: 'Karnal', state: 'Haryana', pincode: '132001' },
    totalAmount: 240,
    status: 'ACCEPTED',
    vehicleAssigned: 'HR-05-CC-5521',
    storageSpec: 'Ventilated Crated Delivery',
    distanceToPickupKm: 4.2,
    locationMatch: 'NEARBY',
    capacityStatus: 'FITS_CAPACITY',
    batchId: 'KS-BATCH-994821',
    batchMinutesRemaining: 48,
  },
  {
    _id: 'ord_demo_cons_2',
    orderNumber: 'ORD-C-102',
    createdAt: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
    cropName: 'Farm Fresh Tomatoes & Cauliflower',
    quantityKg: 11,
    totalOrderKg: 11,
    farmerName: 'Kheri FPO Member Cluster',
    farmerLocation: 'Karnal FPO Center (10-20km Hub)',
    buyerName: 'Rajesh Gupta',
    buyerOrg: 'Street 4, Model Town',
    buyerRole: 'CONSUMER',
    isConsumer: true,
    dispatchModel: 'AREA_BATCHED_20KM',
    fpoRadiusKm: 8.5,
    deliveryCity: 'Model Town',
    deliveryState: 'Karnal',
    deliveryAddress: { street: 'Street 4, Near Park, Model Town', city: 'Karnal', state: 'Haryana', pincode: '132001' },
    totalAmount: 310,
    status: 'ACCEPTED',
    vehicleAssigned: 'HR-05-CC-5521',
    storageSpec: 'Ventilated Crated Delivery',
    distanceToPickupKm: 8.5,
    locationMatch: 'NEARBY',
    capacityStatus: 'FITS_CAPACITY',
    batchId: 'KS-BATCH-994822',
    batchMinutesRemaining: 150,
  },
  {
    _id: 'ord_demo_cons_3',
    orderNumber: 'ORD-C-103',
    createdAt: new Date(Date.now() - 4.8 * 3600 * 1000).toISOString(),
    cropName: 'Fresh Spinach & Onion Box',
    quantityKg: 6,
    totalOrderKg: 6,
    farmerName: 'Kheri FPO Member Cluster',
    farmerLocation: 'Karnal FPO Center (10-20km Hub)',
    buyerName: 'Sunita Sharma',
    buyerOrg: 'Plot 12, Urban Estate',
    buyerRole: 'CONSUMER',
    isConsumer: true,
    dispatchModel: 'AREA_BATCHED_20KM',
    fpoRadiusKm: 13.8,
    deliveryCity: 'Urban Estate',
    deliveryState: 'Karnal',
    deliveryAddress: { street: 'Plot 12, Sector 8, Urban Estate', city: 'Karnal', state: 'Haryana', pincode: '132001' },
    totalAmount: 180,
    status: 'ACCEPTED',
    vehicleAssigned: 'HR-05-CC-5521',
    storageSpec: 'Ventilated Crated Delivery',
    distanceToPickupKm: 13.8,
    locationMatch: 'NEARBY',
    capacityStatus: 'FITS_CAPACITY',
    batchId: 'KS-BATCH-994823',
    batchMinutesRemaining: 12,
  },
  {
    _id: 'ord_demo_cons_4',
    orderNumber: 'ORD-C-104',
    createdAt: new Date(Date.now() - 5.1 * 3600 * 1000).toISOString(),
    cropName: 'Whole Wheat Flour (Chakki Fresh)',
    quantityKg: 10,
    totalOrderKg: 10,
    farmerName: 'Kheri FPO Member Cluster',
    farmerLocation: 'Karnal FPO Center (10-20km Hub)',
    buyerName: 'Deepak Malik',
    buyerOrg: 'G.T. Road Enclave',
    buyerRole: 'CONSUMER',
    isConsumer: true,
    dispatchModel: 'AREA_BATCHED_20KM',
    fpoRadiusKm: 18.4,
    deliveryCity: 'G.T. Road',
    deliveryState: 'Karnal',
    deliveryAddress: { street: 'Flat 2B, G.T. Road Enclave', city: 'Karnal', state: 'Haryana', pincode: '132001' },
    totalAmount: 380,
    status: 'IN_TRANSIT',
    vehicleAssigned: 'HR-05-CC-5521',
    storageSpec: 'Ventilated Crated Delivery',
    distanceToPickupKm: 18.4,
    locationMatch: 'NEARBY',
    capacityStatus: 'FITS_CAPACITY',
    batchId: 'KS-BATCH-994824',
    batchMinutesRemaining: 0,
  },
];

const INITIAL_FLEET_VEHICLES = [
  {
    vehicleNo: 'HR-05-CC-9988',
    type: 'Refrigerated Eicher Pro (8 Ton - Dedicated Bulk Freight)',
    driverName: 'Sukhwinder Singh',
    driverPhone: '+91 98123 45678',
    storageSpec: 'Refrigerated (2°C - 6°C Target)',
    status: 'IN_TRANSIT',
    capacityKg: 8000,
    utilizedKg: 4500,
    currentLocation: 'Panipat Transit Hub (Dedicated Bulk Linehaul)',
    currentTempC: 3.8,
    targetTemp: 3.5,
    targetTempRange: '2.0°C - 6.0°C',
    humidityPercentage: 88,
    tempStatus: 'OPTIMAL',
    gpsCoordinates: { lat: 29.3909, lng: 76.9635 },
    speedKmh: 54,
    batteryPercentage: 96,
    fuelPercentage: 82,
    compressorStatus: 'ACTIVE_COOLING',
    complianceScore: 99.4,
    activeConsignment: '#ORD-8921 (Organic Tomato 2,000 kg)',
    recentLogs: [
      { time: 'Just now', temp: 3.8, humidity: 88, speed: 54, status: 'NORMAL' },
      { time: '2m ago', temp: 3.9, humidity: 87, speed: 52, status: 'NORMAL' },
      { time: '5m ago', temp: 4.1, humidity: 89, speed: 48, status: 'NORMAL' },
      { time: '10m ago', temp: 4.2, humidity: 86, speed: 60, status: 'NORMAL' },
    ],
  },
  {
    vehicleNo: 'HR-05-CC-7712',
    type: 'Cold-Chain Tata 407 (3.5 Ton - Regional Heavy Shuttle)',
    driverName: 'Manpreet Singh',
    driverPhone: '+91 98765 43210',
    storageSpec: 'Insulated Refrigerated (4°C - 8°C Target)',
    status: 'AVAILABLE',
    capacityKg: 3500,
    utilizedKg: 1500,
    currentLocation: 'Karnal FPO Aggregation Yard',
    currentTempC: 5.2,
    targetTemp: 5.0,
    targetTempRange: '4.0°C - 8.0°C',
    humidityPercentage: 79,
    tempStatus: 'OPTIMAL',
    gpsCoordinates: { lat: 29.6857, lng: 76.9905 },
    speedKmh: 0,
    batteryPercentage: 100,
    fuelPercentage: 90,
    compressorStatus: 'STANDBY',
    complianceScore: 98.7,
    activeConsignment: '#ORD-8922 (Potato Grade A 1,500 kg)',
    recentLogs: [
      { time: 'Just now', temp: 5.2, humidity: 79, speed: 0, status: 'NORMAL' },
      { time: '5m ago', temp: 5.1, humidity: 80, speed: 0, status: 'NORMAL' },
      { time: '12m ago', temp: 5.4, humidity: 78, speed: 18, status: 'NORMAL' },
    ],
  },
  {
    vehicleNo: 'HR-05-CC-5521',
    type: 'Eco EV Delivery Van 1 (1 Ton - North Cluster Shuttle)',
    driverName: 'Vikram Rawat',
    driverPhone: '+91 97234 11223',
    storageSpec: 'Ventilated Crated Delivery (15°C - 20°C)',
    status: 'IN_TRANSIT',
    capacityKg: 1000,
    utilizedKg: 35,
    currentLocation: 'Sector 14 Corridor, Karnal (20km Batch)',
    currentTempC: 18.2,
    targetTemp: 18.0,
    targetTempRange: '15.0°C - 22.0°C',
    humidityPercentage: 65,
    tempStatus: 'OPTIMAL',
    gpsCoordinates: { lat: 29.6920, lng: 76.9810 },
    speedKmh: 32,
    batteryPercentage: 92,
    fuelPercentage: 74,
    compressorStatus: 'VENTILATION_ACTIVE',
    complianceScore: 99.1,
    activeConsignment: 'North Cluster Drops (#ORD-C-101 & #ORD-C-103)',
    recentLogs: [
      { time: 'Just now', temp: 18.2, humidity: 65, speed: 32, status: 'NORMAL' },
      { time: '3m ago', temp: 18.5, humidity: 64, speed: 28, status: 'NORMAL' },
      { time: '7m ago', temp: 18.1, humidity: 66, speed: 35, status: 'NORMAL' },
    ],
  },
  {
    vehicleNo: 'HR-05-EV-3310',
    type: 'Eco EV Delivery Van 2 (1 Ton - South Cluster Shuttle)',
    driverName: 'Rohan Verma',
    driverPhone: '+91 98111 22334',
    storageSpec: 'Ventilated Crated Delivery (15°C - 20°C)',
    status: 'AVAILABLE',
    capacityKg: 1000,
    utilizedKg: 25,
    currentLocation: 'Karnal FPO Center (Ready for South Sector)',
    currentTempC: 18.0,
    targetTemp: 18.0,
    targetTempRange: '15.0°C - 22.0°C',
    humidityPercentage: 62,
    tempStatus: 'OPTIMAL',
    gpsCoordinates: { lat: 29.6780, lng: 77.0120 },
    speedKmh: 0,
    batteryPercentage: 98,
    fuelPercentage: 95,
    compressorStatus: 'STANDBY',
    complianceScore: 99.6,
    activeConsignment: 'South Cluster Drops (#ORD-C-102 & #ORD-C-104)',
    recentLogs: [
      { time: 'Just now', temp: 18.0, humidity: 62, speed: 0, status: 'NORMAL' },
      { time: '5m ago', temp: 18.1, humidity: 63, speed: 0, status: 'NORMAL' },
    ],
  },
];

const DEFAULT_ROUTE_DATA = {
  summary: {
    mode: 'CONSUMER_DIRECTIONAL_SPLIT',
    title: 'AI 2-Directional Split Dispatch (Parallel Shuttles)',
    totalDistanceKm: 24.8,
    totalDurationHours: '0.8',
    totalWaypoints: 5,
    costSavingsPercentage: 56,
    estimatedCO2ReducedKg: 24,
    radiusKm: 20,
    batchWindowHours: 5,
  },
  route: {
    waypoints: [
      {
        type: 'COLLECTION_HUB',
        name: 'KisanSetu Local FPO Supply Hub (0 km)',
        location: { lat: 29.6857, lng: 76.9905 },
        address: 'Kheri FPO Aggregation Center, Karnal, Haryana',
        crop: 'Consolidated Consumer Produce (35 kg)',
      },
      {
        type: 'BUYER_DROP',
        name: 'Drop 1: Anita Verma (Sector 14 - North)',
        location: { lat: 29.6920, lng: 76.9810 },
        address: 'House #402, Sector 14, Karnal, Haryana',
        crop: 'Fresh Tomato (3 kg), Potato (5 kg)',
        weightKg: 8,
        bearing: '025° NNE',
        distanceKm: 4.2,
      },
      {
        type: 'BUYER_DROP',
        name: 'Drop 2: Sunita Sharma (Urban Estate - North-East)',
        location: { lat: 29.7150, lng: 77.0350 },
        address: 'Plot 12, Urban Estate, Karnal, Haryana',
        crop: 'Sharbati Wheat (10 kg), Tomato (2 kg)',
        weightKg: 12,
        bearing: '048° NE',
        distanceKm: 13.8,
      },
      {
        type: 'BUYER_DROP',
        name: 'Drop 3: Rajesh Gupta (Model Town - South-East)',
        location: { lat: 29.6780, lng: 77.0120 },
        address: 'Street 4, Model Town, Karnal, Haryana',
        crop: 'Organic Spinach (2 kg), Onion (4 kg)',
        weightKg: 6,
        bearing: '135° SE',
        distanceKm: 8.5,
      },
      {
        type: 'BUYER_DROP',
        name: 'Drop 4: Deepak Malik (G.T. Road - South-West)',
        location: { lat: 29.6420, lng: 76.9450 },
        address: 'G.T. Road Enclave, Karnal, Haryana',
        crop: 'Potato (5 kg), Tomato (4 kg)',
        weightKg: 9,
        bearing: '210° SSW',
        distanceKm: 18.4,
      },
    ],
  },
  fleetOptimization: {
    scenario: 'opposite_directions',
    optimalRidersCount: 2,
    activeRidersCount: 2,
    totalDeliveryRevenueRs: 680,
    recommendationVerdict: '⭐ OPTIMAL LOWEST COST (₹210 Minimum)',
    recommendationReason:
      '2 parallel directional riders cut criss-crossing completely. Delivers in 45 mins with 0 spoilage, minimizing total logistics cost to ₹210 and maximizing net profit to ₹470 (+67.8%).',
    fleetMatrix: [
      {
        ridersCount: 1,
        label: '1 Delivery Boy (Solo Van)',
        combinedDistanceKm: 34.2,
        maxDurationMins: 105,
        fuelEnergyCostRs: 210,
        deliveryBoyWagesRs: 130,
        spoilagePenaltyRs: 60,
        totalCostRs: 400,
        netProfitRs: 280,
        profitMarginPct: 41.2,
        isOptimal: false,
        recommendationVerdict: 'High Delay (105m) & ₹400 Cost',
        reasoning: '1 van criss-crosses city center traffic for 105 mins. Spoilage risk and excess fuel waste ₹190.',
      },
      {
        ridersCount: 2,
        label: '2 Delivery Boys (North + South Shuttles)',
        combinedDistanceKm: 24.8,
        maxDurationMins: 45,
        fuelEnergyCostRs: 120,
        deliveryBoyWagesRs: 90,
        spoilagePenaltyRs: 0,
        totalCostRs: 210,
        netProfitRs: 470,
        profitMarginPct: 69.1,
        isOptimal: true,
        recommendationVerdict: '⭐ OPTIMAL LOWEST COST (₹210 Minimum)',
        reasoning: '2 parallel directional riders cut criss-crossing completely. Delivers in 45 mins with 0 spoilage, maximizing net profit at ₹470 (+67.8% profit).',
      },
      {
        ridersCount: 3,
        label: '3 Delivery Boys (North + South + East)',
        combinedDistanceKm: 27.0,
        maxDurationMins: 25,
        fuelEnergyCostRs: 110,
        deliveryBoyWagesRs: 140,
        spoilagePenaltyRs: 0,
        totalCostRs: 250,
        netProfitRs: 430,
        profitMarginPct: 63.2,
        isOptimal: false,
        recommendationVerdict: 'Fast (25m) but +₹40 Higher Cost',
        reasoning: 'Delivers in 25 mins, but additional 3rd rider wage increases total cost from ₹210 to ₹250.',
      },
      {
        ridersCount: 4,
        label: '4 Delivery Boys (1 Drop Per Rider)',
        combinedDistanceKm: 32.0,
        maxDurationMins: 18,
        fuelEnergyCostRs: 120,
        deliveryBoyWagesRs: 200,
        spoilagePenaltyRs: 0,
        totalCostRs: 320,
        netProfitRs: 360,
        profitMarginPct: 52.9,
        isOptimal: false,
        recommendationVerdict: 'Hyper-Fast (18m) but +₹110 Cost',
        reasoning: 'Point-to-point direct drop. Very fast, but 4 rider base wages increase total cost to ₹320.',
      },
      {
        ridersCount: 5,
        label: '5 Delivery Boys',
        combinedDistanceKm: 36.0,
        maxDurationMins: 15,
        fuelEnergyCostRs: 140,
        deliveryBoyWagesRs: 250,
        spoilagePenaltyRs: 0,
        totalCostRs: 390,
        netProfitRs: 290,
        profitMarginPct: 42.6,
        isOptimal: false,
        recommendationVerdict: '+₹180 Over-Allocated',
        reasoning: '5 riders exceed optimal workforce capacity for 4 consumer orders.',
      },
    ],
    routes: [
      {
        routeId: 'route_north_1',
        routeIndex: 1,
        routeName: 'Route 1: North-East Corridor Shuttle',
        zone: 'Sector 14 & Urban Estate',
        color: '#059669',
        colorName: 'Emerald Green',
        rider: {
          riderId: 'rider_1',
          name: 'Vikram Rawat',
          phone: '+91 97234 11223',
          vehicleNo: 'HR-05-CC-5521',
          vehicleType: 'Eco Electric 3-Wheeler (1 Ton)',
          color: '#059669',
          colorName: 'Emerald Green',
          roleTitle: 'North Sector Delivery Lead',
        },
        distanceKm: 13.2,
        durationMins: 45,
        totalKg: 20,
        waypoints: [
          {
            type: 'COLLECTION_HUB',
            name: 'Kheri FPO Central Hub',
            location: { lat: 29.6857, lng: 76.9905 },
            address: 'Kheri FPO Hub, Karnal',
          },
          {
            type: 'BUYER_DROP',
            name: 'Drop 1: Anita Verma (Sector 14 - North)',
            location: { lat: 29.6920, lng: 76.9810 },
            address: 'House #402, Sector 14, Karnal',
            crop: 'Tomato (3 kg), Potato (5 kg)',
            weightKg: 8,
            bearing: '025° NNE',
            distanceKm: 4.2,
          },
          {
            type: 'BUYER_DROP',
            name: 'Drop 2: Sunita Sharma (Urban Estate - North-East)',
            location: { lat: 29.7150, lng: 77.0350 },
            address: 'Plot 12, Urban Estate, Karnal',
            crop: 'Wheat (10 kg), Tomato (2 kg)',
            weightKg: 12,
            bearing: '048° NE',
            distanceKm: 13.8,
          },
        ],
      },
      {
        routeId: 'route_south_2',
        routeIndex: 2,
        routeName: 'Route 2: South-West Corridor Shuttle',
        zone: 'Model Town & G.T. Road South',
        color: '#6366f1',
        colorName: 'Indigo Purple',
        rider: {
          riderId: 'rider_2',
          name: 'Rohan Verma',
          phone: '+91 98111 22334',
          vehicleNo: 'HR-05-EV-3310',
          vehicleType: 'Eco EV Van 2 (1 Ton)',
          color: '#6366f1',
          colorName: 'Indigo Purple',
          roleTitle: 'South Sector Delivery Lead',
        },
        distanceKm: 11.6,
        durationMins: 40,
        totalKg: 15,
        waypoints: [
          {
            type: 'COLLECTION_HUB',
            name: 'Kheri FPO Central Hub',
            location: { lat: 29.6857, lng: 76.9905 },
            address: 'Kheri FPO Hub, Karnal',
          },
          {
            type: 'BUYER_DROP',
            name: 'Drop 3: Rajesh Gupta (Model Town - South-East)',
            location: { lat: 29.6780, lng: 77.0120 },
            address: 'Street 4, Model Town, Karnal',
            crop: 'Spinach (2 kg), Onion (4 kg)',
            weightKg: 6,
            bearing: '135° SE',
            distanceKm: 8.5,
          },
          {
            type: 'BUYER_DROP',
            name: 'Drop 4: Deepak Malik (G.T. Road - South-West)',
            location: { lat: 29.6420, lng: 76.9450 },
            address: 'G.T. Road Enclave, Karnal',
            crop: 'Potato (5 kg), Tomato (4 kg)',
            weightKg: 9,
            bearing: '210° SSW',
            distanceKm: 18.4,
          },
        ],
      },
    ],
    assignedRoster: [
      {
        riderId: 'rider_1',
        name: 'Vikram Rawat',
        phone: '+91 97234 11223',
        vehicleNo: 'HR-05-CC-5521',
        vehicleType: 'Eco Electric 3-Wheeler (1 Ton)',
        color: '#059669',
        colorName: 'Emerald Green',
        roleTitle: 'North Sector Delivery Lead',
        zone: 'Sector 14 & Urban Estate',
        distanceKm: 13.2,
        durationMins: 45,
        totalKg: 20,
        stopsCount: 2,
      },
      {
        riderId: 'rider_2',
        name: 'Rohan Verma',
        phone: '+91 98111 22334',
        vehicleNo: 'HR-05-EV-3310',
        vehicleType: 'Eco EV Van 2 (1 Ton)',
        color: '#6366f1',
        colorName: 'Indigo Purple',
        roleTitle: 'South Sector Delivery Lead',
        zone: 'Model Town & G.T. Road South',
        distanceKm: 11.6,
        durationMins: 40,
        totalKg: 15,
        stopsCount: 2,
      },
    ],
  },
  directionalAnalysis: {
    scenario: 'opposite_directions',
    angularDivergenceDeg: 162,
    recommendation: 'SPLIT_INTO_2_DIRECTIONAL_BATCHES',
    recommendationReason:
      'Order destinations diverge by 162° (North Sector vs South GT Road). Dispatching 2 directional eco-shuttles saves 9.4 km, eliminates 60 mins transit delay, and boosts delivery margin by +32.3% vs a single criss-crossing van.',
    totalDeliveryRevenueRs: 680,
    singleVan: {
      distanceKm: 34.2,
      durationMinutes: 105,
      fuelCostRs: 210,
      driverWageRs: 130,
      spoilagePenaltyRs: 60,
      totalCostRs: 400,
      netProfitRs: 280,
      profitMarginPct: 41.2,
      freshnessRetentionPct: 88,
    },
    splitShuttles: {
      clusterANorthDistanceKm: 13.2,
      clusterBSouthDistanceKm: 11.6,
      totalDistanceKm: 24.8,
      maxDurationMinutes: 45,
      fuelCostRs: 120,
      driverWageRs: 90,
      spoilagePenaltyRs: 0,
      totalCostRs: 210,
      netProfitRs: 470,
      profitMarginPct: 69.1,
      profitDeltaRs: 190,
      profitDeltaPercentage: 67.8,
      costSavingsVsSingleRs: 190,
      freshnessRetentionPct: 99.4,
    },
    clusterA: [
      {
        type: 'COLLECTION_HUB',
        name: 'Kheri FPO Central Hub',
        location: { lat: 29.6857, lng: 76.9905 },
        address: 'Kheri FPO Hub, Karnal',
      },
      {
        type: 'BUYER_DROP',
        name: 'Drop 1: Anita Verma (Sector 14 - North)',
        location: { lat: 29.6920, lng: 76.9810 },
        address: 'House #402, Sector 14, Karnal',
        crop: 'Tomato (3 kg), Potato (5 kg)',
        weightKg: 8,
        bearing: '025° NNE',
        distanceKm: 4.2,
      },
      {
        type: 'BUYER_DROP',
        name: 'Drop 2: Sunita Sharma (Urban Estate - North-East)',
        location: { lat: 29.7150, lng: 77.0350 },
        address: 'Plot 12, Urban Estate, Karnal',
        crop: 'Wheat (10 kg), Tomato (2 kg)',
        weightKg: 12,
        bearing: '048° NE',
        distanceKm: 13.8,
      },
    ],
    clusterB: [
      {
        type: 'COLLECTION_HUB',
        name: 'Kheri FPO Central Hub',
        location: { lat: 29.6857, lng: 76.9905 },
        address: 'Kheri FPO Hub, Karnal',
      },
      {
        type: 'BUYER_DROP',
        name: 'Drop 3: Rajesh Gupta (Model Town - South-East)',
        location: { lat: 29.6780, lng: 77.0120 },
        address: 'Street 4, Model Town, Karnal',
        crop: 'Spinach (2 kg), Onion (4 kg)',
        weightKg: 6,
        bearing: '135° SE',
        distanceKm: 8.5,
      },
      {
        type: 'BUYER_DROP',
        name: 'Drop 4: Deepak Malik (G.T. Road - South-West)',
        location: { lat: 29.6420, lng: 76.9450 },
        address: 'G.T. Road Enclave, Karnal',
        crop: 'Potato (5 kg), Tomato (4 kg)',
        weightKg: 9,
        bearing: '210° SSW',
        distanceKm: 18.4,
      },
    ],
  },
};

const LogisticsDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabParam = searchParams.get('tab') || 'dispatches'; // 'dispatches' | 'route-map' | 'fleet-telemetry'

  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState(
    activeTabParam === 'route-map'
      ? 'TSP_OPTIMIZER'
      : activeTabParam === 'fleet-telemetry'
      ? 'COLD_CHAIN_FLEET'
      : 'SHIPMENT_DETAILS'
  );

  const [streamFilter, setStreamFilter] = useState('ALL'); // 'ALL' | 'CONSUMER_BATCHED' | 'BULK_DEDICATED'
  const [tasks, setTasks] = useState([]);
  const [demoTasks, setDemoTasks] = useState(DEMO_PICKUP_REQUESTS);
  const [selectedOrderId, setSelectedOrderId] = useState('ord_demo_cons_1');
  const [carrierProfile, setCarrierProfile] = useState({ capacityKg: 5000, serviceAreas: [] });
  const [fleetVehicles, setFleetVehicles] = useState(INITIAL_FLEET_VEHICLES);
  const [selectedVehicleNo, setSelectedVehicleNo] = useState('HR-05-CC-9988');
  const [isLiveTelemetryActive, setIsLiveTelemetryActive] = useState(true);
  const [lastTelemetryTick, setLastTelemetryTick] = useState(new Date());
  const [routeData, setRouteData] = useState(DEFAULT_ROUTE_DATA);
  const [routeMode, setRouteMode] = useState('CONSUMER_DIRECTIONAL_SPLIT');
  const [directionalScenario, setDirectionalScenario] = useState('opposite_directions');
  const [selectedFleetSize, setSelectedFleetSize] = useState(2);
  const [isSplitView, setIsSplitView] = useState(true);
  const [loading, setLoading] = useState(true);
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrModalMode, setQrModalMode] = useState('PICKUP');
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState(null);
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [dispatchedFleetInfo, setDispatchedFleetInfo] = useState(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);

  const fetchLogisticsData = async (scenarioOverride, fleetSizeOverride) => {
    try {
      const activeScenario = scenarioOverride || directionalScenario;
      const activeFleetSize = fleetSizeOverride !== undefined ? fleetSizeOverride : selectedFleetSize;
      const [tasksRes, routeRes, telemetryRes] = await Promise.allSettled([
        API.get('/logistics/tasks'),
        API.post('/logistics/optimize', { mode: routeMode, scenario: activeScenario, fleetSize: activeFleetSize }),
        API.get('/logistics/telemetry'),
      ]);

      if (tasksRes.status === 'fulfilled' && tasksRes.value?.data?.success) {
        setTasks(tasksRes.value.data.orders || []);
        if (tasksRes.value.data.carrierProfile) {
          setCarrierProfile(tasksRes.value.data.carrierProfile);
        }
        if (tasksRes.value.data.orders?.length > 0) {
          setSelectedOrderId(tasksRes.value.data.orders[0]._id);
        }
      }

      if (routeRes.status === 'fulfilled' && routeRes.value?.data?.success) {
        setRouteData(routeRes.value.data);
      }

      if (telemetryRes.status === 'fulfilled' && telemetryRes.value?.data?.success) {
        const rawVehicles = telemetryRes.value.data.vehicles || [];
        if (rawVehicles.length > 0) {
          setFleetVehicles((prev) =>
            rawVehicles.map((rv, idx) => ({
              ...prev[idx],
              ...rv,
              targetTemp: prev[idx]?.targetTemp || 3.5,
              recentLogs: prev[idx]?.recentLogs || INITIAL_FLEET_VEHICLES[idx % INITIAL_FLEET_VEHICLES.length].recentLogs,
            }))
          );
        }
      }
    } catch (err) {
      console.error('Error fetching logistics data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogisticsData();
  }, [routeMode, directionalScenario]);

  const handleScenarioChange = (scenarioKey) => {
    setDirectionalScenario(scenarioKey);
    const newOptimalFleet = scenarioKey === 'linear_corridor' ? 1 : 2;
    setSelectedFleetSize(newOptimalFleet);
    setIsSplitView(scenarioKey !== 'linear_corridor');
    fetchLogisticsData(scenarioKey, newOptimalFleet);
  };

  const handleFleetSizeChange = (fleetSize) => {
    const sizeNum = Number(fleetSize);
    setSelectedFleetSize(sizeNum);
    setIsSplitView(sizeNum > 1);
    fetchLogisticsData(directionalScenario, sizeNum);
  };

  const handleDispatchAction = async (strategy, fleetCount = null) => {
    const activeSize = fleetCount || selectedFleetSize || 2;
    setIsDispatching(true);

    const activeFleetStats = (routeData?.fleetOptimization?.fleetMatrix || DEFAULT_ROUTE_DATA.fleetOptimization.fleetMatrix).find(
      (f) => f.ridersCount === activeSize
    );
    const activeRoutes = routeData?.fleetOptimization?.routes || DEFAULT_ROUTE_DATA.fleetOptimization.routes;
    const activeRoster = activeRoutes.map((r, idx) => ({
      ...r.rider,
      routeTitle: r.routeName,
      color: r.color || (idx === 0 ? '#059669' : '#6366f1'),
      stops: r.waypoints?.filter((w) => w.type === 'BUYER_DROP') || [],
      totalKg: r.totalKg || 15,
    }));

    // Realistic visual feedback / async transmission simulation
    await new Promise((resolve) => setTimeout(resolve, 600));

    const batchCode = `BATCH-20KM-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDispatchInfo = {
      batchId: batchCode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fleetCount: activeSize,
      costRs: activeFleetStats?.totalCostRs || 210,
      profitRs: activeFleetStats?.netProfitRs || 470,
      savingsPct: activeFleetStats?.profitMarginPct || 69.1,
      roster: activeRoster,
    };

    setDispatchedFleetInfo(newDispatchInfo);
    setIsDispatching(false);
    setIsDispatched(true);
    setDispatchModalOpen(true);

    const rosterNames = activeRoster.map((r) => `${r.name} (${r.vehicleNo})`).join(', ');
    setStatusUpdateSuccess(
      `⚡ Dispatched AI Fleet (${activeSize} Delivery Personnel): ${rosterNames}. Minimized logistics cost: ₹${activeFleetStats?.totalCostRs || 210}, Net Profit: ₹${activeFleetStats?.netProfitRs || 470} with 0 Spoilage!`
    );

    // Update local demo state
    setDemoTasks((prev) =>
      prev.map((t) => (t.isConsumer ? { ...t, status: 'IN_TRANSIT', vehicleAssigned: activeRoster[0]?.vehicleNo || 'HR-05-CC-5521' } : t))
    );

    // Update real orders in DB if live tasks exist
    if (tasks && tasks.length > 0) {
      const pendingConsumerTasks = tasks.filter(
        (t) => (t.isConsumer || t.buyerRole === 'CONSUMER' || (t.totalOrderKg || t.quantityKg || 0) <= 50) &&
          !['DELIVERED', 'COMPLETED', 'CANCELLED'].includes(t.status)
      );
      for (const t of pendingConsumerTasks) {
        try {
          await API.put(`/orders/${t._id}/status`, {
            status: 'IN_TRANSIT',
            vehicleAssigned: activeRoster[0]?.vehicleNo || 'HR-05-CC-5521',
            notes: `Dispatched via 20km Area-Batch Fleet. Carrier: ${activeRoster[0]?.name || 'EV Delivery Partner'}.`,
          });
        } catch (e) {
          console.error('Error dispatching task in DB:', e);
        }
      }
      fetchLogisticsData();
    }

    // Update fleet telemetry active status
    setFleetVehicles((prev) =>
      prev.map((v, i) => (i < activeSize ? { ...v, status: 'IN_TRANSIT' } : v))
    );
    setTimeout(() => setStatusUpdateSuccess(''), 8000);
  };

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'route-map') setActiveWorkspaceTab('TSP_OPTIMIZER');
    else if (tabParam === 'fleet-telemetry') setActiveWorkspaceTab('COLD_CHAIN_FLEET');
    else if (tabParam === 'dispatches') setActiveWorkspaceTab('SHIPMENT_DETAILS');
  }, [searchParams]);

  // Real-time IoT Sensor Stream Simulation (Auto-ticks every 3.5s when active)
  useEffect(() => {
    if (!isLiveTelemetryActive) return;

    const interval = setInterval(() => {
      setLastTelemetryTick(new Date());
      setFleetVehicles((prevVehicles) =>
        prevVehicles.map((v) => {
          if (v.status !== 'IN_TRANSIT') return v;

          // Tiny realistic temperature jitter around target
          const delta = (Math.random() - 0.5) * 0.2;
          const newTemp = Math.round((v.currentTempC + delta) * 10) / 10;
          const newHumidity = Math.min(95, Math.max(50, Math.round(v.humidityPercentage + (Math.random() - 0.5) * 2)));
          const newSpeed = Math.max(0, Math.min(80, Math.round(v.speedKmh + (Math.random() - 0.5) * 4)));

          const newLog = {
            time: 'Just now',
            temp: newTemp,
            humidity: newHumidity,
            speed: newSpeed,
            status: newTemp > 7 ? 'WARNING' : 'NORMAL',
          };

          const updatedLogs = [
            newLog,
            ...(v.recentLogs || []).slice(0, 3).map((l, i) => ({
              ...l,
              time: `${(i + 1) * 3}m ago`,
            })),
          ];

          return {
            ...v,
            currentTempC: newTemp,
            humidityPercentage: newHumidity,
            speedKmh: newSpeed,
            tempStatus: newTemp > 7 ? 'WARNING' : 'OPTIMAL',
            recentLogs: updatedLogs,
          };
        })
      );
    }, 3500);

    return () => clearInterval(interval);
  }, [isLiveTelemetryActive]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setStatusUpdateSuccess('');
    setErrorMessage('');

    if (orderId && orderId.startsWith('ord_demo')) {
      setDemoTasks((prev) =>
        prev.map((item) => (item._id === orderId ? { ...item, status: newStatus } : item))
      );
      setStatusUpdateSuccess(`Shipment #${orderId} status updated to ${newStatus}!`);
      return;
    }

    try {
      const { data } = await API.put(`/orders/${orderId}/status`, { status: newStatus });
      if (data.success) {
        setStatusUpdateSuccess(`Shipment status updated to ${newStatus} successfully!`);
        fetchLogisticsData();
      } else {
        setErrorMessage(data.message || 'Failed to update shipment status.');
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      setErrorMessage(err.response?.data?.message || 'Unauthorized or error updating order status.');
    }
  };

  // Thermostat Set Point Adjuster
  const handleSetTargetTemp = (vehicleNo, newTarget) => {
    setFleetVehicles((prev) =>
      prev.map((v) =>
        v.vehicleNo === vehicleNo
          ? {
              ...v,
              targetTemp: newTarget,
              targetTempRange: `${newTarget - 1.5}°C - ${newTarget + 1.5}°C`,
              compressorStatus: 'COOLING_ADJUSTED',
            }
          : v
      )
    );
    setStatusUpdateSuccess(`🌡️ Reefer Thermostat for ${vehicleNo} set to target ${newTarget}°C. Compressor adjusting...`);
  };

  // Ping IoT Sensors Action
  const handlePingSensors = (vehicleNo) => {
    setLastTelemetryTick(new Date());
    setStatusUpdateSuccess(`📡 Diagnostic ping sent to ${vehicleNo} IoT controller. GPS & Temperature sensors responding in 24ms.`);
  };

  // Trigger Defrost Cycle
  const handleTriggerDefrost = (vehicleNo) => {
    setFleetVehicles((prev) =>
      prev.map((v) => (v.vehicleNo === vehicleNo ? { ...v, compressorStatus: 'DEFROST_CYCLE_ACTIVE' } : v))
    );
    setStatusUpdateSuccess(`❄️ Automated hot-gas defrost cycle initiated for Reefer ${vehicleNo}. Duration: 6 minutes.`);
  };

  const rawDisplayTasks = tasks.length > 0 ? tasks : demoTasks;

  // Filtered master list
  const displayTasks = rawDisplayTasks.filter((item) => {
    const isConsumer = item.isConsumer || item.buyerRole === 'CONSUMER' || (item.totalOrderKg || item.quantityKg) <= 50;

    if (streamFilter === 'CONSUMER_BATCHED' && !isConsumer) return false;
    if (streamFilter === 'BULK_DEDICATED' && isConsumer) return false;

    const cropName = item.cropName || (item.items && item.items[0]?.cropName) || '';
    const farmer = item.farmerName || (item.items && item.items[0]?.farmer?.name) || '';
    const buyer = item.buyerName || item.buyer?.name || '';
    const orderNo = item.orderNumber || '';

    const matchesSearch =
      cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      buyer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      orderNo.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && (item.status === 'PENDING' || item.status === 'CONFIRMED')) ||
      (statusFilter === 'ACCEPTED' && item.status === 'ACCEPTED') ||
      (statusFilter === 'IN_TRANSIT' && item.status === 'IN_TRANSIT') ||
      (statusFilter === 'DELIVERED' && (item.status === 'DELIVERED' || item.status === 'COMPLETED'));

    return matchesSearch && matchesStatus;
  });

  // Selected order document
  const selectedOrder = rawDisplayTasks.find((o) => o._id === selectedOrderId) || displayTasks[0] || rawDisplayTasks[0];

  // Selected vehicle for telemetry
  const selectedVehicle = fleetVehicles.find((v) => v.vehicleNo === selectedVehicleNo) || fleetVehicles[0];

  // KPI Metrics
  const consumerOrdersCount = rawDisplayTasks.filter(
    (t) => t.isConsumer || t.buyerRole === 'CONSUMER' || (t.totalOrderKg || t.quantityKg) <= 50
  ).length;

  const bulkOrdersCount = rawDisplayTasks.filter(
    (t) => !(t.isConsumer || t.buyerRole === 'CONSUMER' || (t.totalOrderKg || t.quantityKg) <= 50)
  ).length;

  const activeInTransitCount = rawDisplayTasks.filter((t) => t.status === 'IN_TRANSIT').length;

  const openQrScanner = (order, mode) => {
    setSelectedOrderForModal(order || selectedOrder);
    setQrModalMode(mode);
    setQrModalOpen(true);
  };

  const openVehicleAssign = (order) => {
    setSelectedOrderForModal(order || selectedOrder);
    setVehicleModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6 pb-12">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#0A2412] via-[#12401E] to-[#1B5E2B] rounded-3xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-1.5 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Unified Cold-Chain Logistics Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Logistics & Dispatch Matrix 🚚
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium">
              Real-time shipment routing: Direct dedicated heavy freight + 5-hour 20km consumer cluster multi-drop loop.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 relative z-10">
            {selectedOrder && ['IN_TRANSIT', 'PICKUP_VERIFIED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(selectedOrder.status) ? (
              <button
                onClick={() => openQrScanner(selectedOrder, 'DELIVERY')}
                className="px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <ShieldCheck className="w-4 h-4 text-purple-200" />
                Confirm POD Delivery
              </button>
            ) : selectedOrder && (selectedOrder.status === 'DELIVERED' || selectedOrder.status === 'COMPLETED') ? (
              <span className="px-4 py-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs shadow-sm flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Delivered &amp; Settled
              </span>
            ) : (
              <button
                onClick={() => openQrScanner(selectedOrder, 'PICKUP')}
                className="px-4 py-2.5 rounded-2xl bg-white text-emerald-950 font-bold text-xs shadow-md hover:bg-emerald-50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-emerald-700" />
                Verify Batch QR (Pickup)
              </button>
            )}

            <button
              onClick={() => {
                setLoading(true);
                fetchLogisticsData();
              }}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* 4 Clean Top KPI Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>20km Consumer Pool</span>
              <Timer className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{consumerOrdersCount}</p>
            <p className="text-[11px] font-bold text-emerald-700">5-Hr Window Active (48% Saved)</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Bulk Dedicated Freight</span>
              <Truck className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{bulkOrdersCount}</p>
            <p className="text-[11px] font-bold text-blue-700">Instant Direct Dispatches</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Active In-Transit</span>
              <Activity className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{activeInTransitCount}</p>
            <p className="text-[11px] font-bold text-amber-700">Live GPS & Cold-Chain</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
              <span>Reefer Fleet Health</span>
              <Thermometer className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-black text-purple-700">98%</p>
            <p className="text-[11px] font-bold text-slate-500">{fleetVehicles.length} Trucks Online</p>
          </div>
        </div>

        {/* Notifications */}
        {statusUpdateSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{statusUpdateSuccess}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold rounded-2xl flex items-center gap-2 shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* =========================================================================
            TOP WORKSPACE NAVIGATION TABS
           ========================================================================= */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-1 max-w-2xl">
            <button
              onClick={() => {
                setActiveWorkspaceTab('SHIPMENT_DETAILS');
                setSearchParams({ tab: 'dispatches' });
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeWorkspaceTab === 'SHIPMENT_DETAILS'
                  ? 'bg-emerald-700 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Shipment Dispatches & Queue</span>
            </button>

            <button
              onClick={() => {
                setActiveWorkspaceTab('TSP_OPTIMIZER');
                setSearchParams({ tab: 'route-map' });
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeWorkspaceTab === 'TSP_OPTIMIZER'
                  ? 'bg-emerald-700 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Navigation className="w-4 h-4" />
              <span>TSP Route Map</span>
            </button>

            <button
              onClick={() => {
                setActiveWorkspaceTab('COLD_CHAIN_FLEET');
                setSearchParams({ tab: 'fleet-telemetry' });
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeWorkspaceTab === 'COLD_CHAIN_FLEET'
                  ? 'bg-emerald-700 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Thermometer className="w-4 h-4" />
              <span>Fleet & Telemetry</span>
            </button>
          </div>

          {/* Live Telemetry Heartbeat Status */}
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] font-bold">
            <div className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${isLiveTelemetryActive ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
              <span className="text-slate-700">IoT Feed: {isLiveTelemetryActive ? 'Streaming' : 'Paused'}</span>
            </div>
            <button
              onClick={() => setIsLiveTelemetryActive(!isLiveTelemetryActive)}
              className="text-emerald-700 hover:underline cursor-pointer"
            >
              {isLiveTelemetryActive ? 'Pause' : 'Resume'}
            </button>
          </div>
        </div>

        {/* =========================================================================
            TAB 1: SHIPMENT QUEUE & CONSIGNMENT DISPATCH DETAILS
           ========================================================================= */}
        {activeWorkspaceTab === 'SHIPMENT_DETAILS' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Shipment Feed */}
            <div className="lg:col-span-5 space-y-3">
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-700" />
                    Shipment Feed ({displayTasks.length})
                  </span>
                  <span className="text-[11px] text-slate-400 font-bold">Select to inspect</span>
                </div>

                {/* Stream Switcher Pills */}
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                  <button
                    onClick={() => setStreamFilter('ALL')}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                      streamFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All ({rawDisplayTasks.length})
                  </button>
                  <button
                    onClick={() => setStreamFilter('CONSUMER_BATCHED')}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      streamFilter === 'CONSUMER_BATCHED' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Timer className="w-3 h-3 text-emerald-600" /> 20km Pool
                  </button>
                  <button
                    onClick={() => setStreamFilter('BULK_DEDICATED')}
                    className={`py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      streamFilter === 'BULK_DEDICATED' ? 'bg-white text-blue-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Zap className="w-3 h-3 text-blue-600" /> Bulk
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search order, crop, buyer, farmer..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 font-medium placeholder:text-slate-400"
                  />
                </div>

                {/* 5-Hour Pooling Live Progress Badge */}
                <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 text-xs flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-emerald-700 animate-pulse" />
                    <div>
                      <span className="font-extrabold text-emerald-950 block text-[11px]">20km Pooling Window</span>
                      <span className="text-[10px] text-emerald-700 font-medium">Batch closes in 2h 45m</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-200/80 text-emerald-900">
                      4 Drops (35 kg)
                    </span>
                    <button
                      onClick={() => {
                        setActiveWorkspaceTab('TSP_OPTIMIZER');
                        setSearchParams({ tab: 'route-map' });
                      }}
                      className="px-2.5 py-1 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-[10px] shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Zap className="w-3 h-3 text-emerald-300" /> Dispatch Pool
                    </button>
                  </div>
                </div>

                {/* Shipment Cards List */}
                <div className="space-y-2.5 max-h-[calc(100vh-21rem)] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                  {displayTasks.length === 0 ? (
                    <div className="py-10 text-center text-slate-400 text-xs font-medium">
                      No shipments match the filter.
                    </div>
                  ) : (
                    displayTasks.map((ord) => {
                      const isSelected = selectedOrder?._id === ord._id;
                      const isConsumer = ord.isConsumer || ord.buyerRole === 'CONSUMER' || (ord.totalOrderKg || ord.quantityKg) <= 50;
                      const cropTitle = ord.cropName || (ord.items && ord.items[0]?.cropName) || 'Farm Produce';
                      const qtyKg = ord.totalOrderKg || ord.quantityKg || (ord.items && ord.items[0]?.quantityKg) || 0;
                      const buyerLoc = ord.buyerOrg || ord.deliveryCity || 'Doorstep Delivery';

                      return (
                        <div
                          key={ord._id || ord.orderNumber}
                          onClick={() => setSelectedOrderId(ord._id)}
                          className={`p-3.5 rounded-2xl transition-all cursor-pointer relative overflow-hidden border ${
                            isSelected
                              ? 'bg-gradient-to-r from-emerald-50/90 via-emerald-50/40 to-white border-y border-r border-emerald-300 border-l-4 border-l-emerald-600 shadow-sm ring-2 ring-emerald-500/15'
                              : 'bg-white hover:bg-slate-50/80 border-slate-200/80 shadow-2xs hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-xs font-black text-slate-900 font-mono">#{ord.orderNumber}</span>
                                <span
                                  className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                                    isConsumer
                                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                      : 'bg-blue-100 text-blue-900 border border-blue-300'
                                  }`}
                                >
                                  {isConsumer ? '20km Pool' : 'Direct Bulk'}
                                </span>
                              </div>
                              <h4 className="text-xs font-black text-slate-800 truncate">{cropTitle}</h4>
                              <p className="text-[11px] text-slate-500 font-medium truncate flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" /> {buyerLoc}
                              </p>
                            </div>

                            <div className="text-right flex-shrink-0 space-y-1">
                              <span className="text-xs font-black text-slate-900 block">
                                {qtyKg.toLocaleString()} kg
                              </span>
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black ${
                                  ord.status === 'DELIVERED' || ord.status === 'COMPLETED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : ord.status === 'IN_TRANSIT'
                                    ? 'bg-blue-100 text-blue-800'
                                    : ord.status === 'ACCEPTED'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {ord.status}
                              </span>
                            </div>
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                            <span className="flex items-center gap-1">
                              <Compass className="w-3 h-3 text-emerald-600" />
                              {ord.distanceToPickupKm ? `${ord.distanceToPickupKm} km from Hub` : 'Local 20km Zone'}
                            </span>
                            {isConsumer ? (
                              ord.status === 'IN_TRANSIT' ? (
                                <span className="font-mono text-emerald-700 font-bold flex items-center gap-1">
                                  🛵 {ord.vehicleAssigned || 'HR-05-EV-5521'} • On Route
                                </span>
                              ) : ord.status === 'DELIVERED' || ord.status === 'COMPLETED' ? (
                                <span className="text-emerald-700 font-bold">✅ Doorstep Delivered</span>
                              ) : (
                                <span className="text-teal-700 font-bold flex items-center gap-1">
                                  ⏳ 5h Batch (EV / Bike)
                                </span>
                              )
                            ) : (
                              ord.status === 'IN_TRANSIT' ? (
                                <span className="font-mono text-blue-700 font-bold flex items-center gap-1">
                                  🚛 {ord.vehicleAssigned || 'HR-05-CC-9988'} (8-Ton)
                                </span>
                              ) : ord.status === 'DELIVERED' || ord.status === 'COMPLETED' ? (
                                <span className="text-emerald-700 font-bold">✅ Bulk DC Delivered</span>
                              ) : ord.vehicleAssigned ? (
                                <span className="font-mono text-blue-700 font-bold">
                                  🚛 {ord.vehicleAssigned}
                                </span>
                              ) : (
                                <span className="text-amber-600 font-bold">⚠️ Awaiting Linehaul Truck</span>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Selected Shipment Detail */}
            <div className="lg:col-span-7 space-y-4">
              {selectedOrder && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-black text-slate-900">
                          Shipment #{selectedOrder.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            selectedOrder.isConsumer || selectedOrder.buyerRole === 'CONSUMER'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-blue-100 text-blue-900 border border-blue-300'
                          }`}
                        >
                          {selectedOrder.isConsumer || selectedOrder.buyerRole === 'CONSUMER' ? '🛒 20km Consumer Area Pool' : '🏢 Dedicated Bulk Linehaul'}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-slate-900">
                        {selectedOrder.cropName || (selectedOrder.items && selectedOrder.items[0]?.cropName) || 'Produce Lot'}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-black px-3 py-1 rounded-full ${
                          selectedOrder.status === 'DELIVERED' || selectedOrder.status === 'COMPLETED'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : ['IN_TRANSIT', 'PICKUP_VERIFIED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(selectedOrder.status)
                            ? 'bg-indigo-100 text-indigo-950 border border-indigo-300'
                            : selectedOrder.status === 'ACCEPTED'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}
                      >
                        {['IN_TRANSIT', 'PICKUP_VERIFIED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(selectedOrder.status)
                          ? 'IN_TRANSIT (SHIPPED 🛵)'
                          : selectedOrder.status === 'DELIVERED' || selectedOrder.status === 'COMPLETED'
                          ? 'DELIVERED ✅'
                          : selectedOrder.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                      <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700" /> Origin: FPO Supply Hub
                      </span>
                      <p className="text-xs font-black text-slate-900">
                        {selectedOrder.farmerName || 'KisanSetu Member FPO Cluster'}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        {selectedOrder.farmerLocation || 'Karnal FPO Center, G.T. Road'}
                      </p>
                      {selectedOrder.batchId && (
                        <span className="inline-block text-[10px] font-mono text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200 font-bold mt-1">
                          Batch: {selectedOrder.batchId}
                        </span>
                      )}
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1.5">
                      <span className="text-[10px] font-black uppercase text-blue-800 tracking-wider flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-blue-700" /> Destination: Buyer Drop
                      </span>
                      <p className="text-xs font-black text-slate-900">
                        {selectedOrder.buyerName || 'Verified Buyer'}
                      </p>
                      <p className="text-[11px] text-slate-600">
                        {selectedOrder.deliveryAddress?.street ? `${selectedOrder.deliveryAddress.street}, ${selectedOrder.deliveryAddress.city}` : selectedOrder.deliveryCity || 'Doorstep Delivery'}
                      </p>
                      <span className="inline-block text-[10px] font-bold text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200 mt-1">
                        {selectedOrder.distanceToPickupKm ? `${selectedOrder.distanceToPickupKm} km from Hub` : 'Within 20 km Range'}
                      </span>
                    </div>
                  </div>

                  {/* Cargo Allocation & Dispatch Model Info */}
                  {selectedOrder.isConsumer || selectedOrder.buyerRole === 'CONSUMER' || (selectedOrder.totalOrderKg || selectedOrder.quantityKg || 0) <= 50 ? (
                    <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/90 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                          <Layers className="w-4 h-4 text-emerald-700" />
                          Consolidated 5-Hour 20km Area Batch Pooling
                        </h4>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-200 text-emerald-900">
                          Pooled Batch
                        </span>
                      </div>

                      <p className="text-[11px] text-emerald-800 leading-relaxed">
                        💡 <b>Collective Dispatch Rule:</b> Consumer orders within the 20km radius are aggregated in the 5-hour batch window and transmitted <b>together</b>. You do not need to assign vehicles individually. The AI calculates optimal routes and assigns delivery boys to minimize total transit cost.
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs pt-1">
                        <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/60">
                          <span className="text-emerald-700 text-[10px] font-bold block">Vehicle Type</span>
                          <span className="font-extrabold text-slate-900 flex items-center gap-1">
                            🛵 EV 3-Wheeler / Bike
                          </span>
                        </div>

                        <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/60">
                          <span className="text-emerald-700 text-[10px] font-bold block">Assigned Delivery Rider</span>
                          <span className="font-mono font-bold text-emerald-800 truncate block">
                            {selectedOrder.vehicleAssigned || 'Vikram Rawat • HR-05-EV-5521'}
                          </span>
                        </div>

                        <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200/60">
                          <span className="text-emerald-700 text-[10px] font-bold block">Batch Radius & Window</span>
                          <span className="font-extrabold text-slate-800">
                            ≤ 20 km • 5-hr Window
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                      <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        Dedicated Bulk Freight Truck Allocation
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-slate-400 text-[10px] font-bold block">Consignment Weight</span>
                          <span className="font-extrabold text-slate-900">
                            {(selectedOrder.totalOrderKg || selectedOrder.quantityKg || 0).toLocaleString()} kg
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 text-[10px] font-bold block">Assigned Linehaul Truck</span>
                          <span className="font-mono font-bold text-blue-700">
                            {selectedOrder.vehicleAssigned || 'None Assigned'}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 text-[10px] font-bold block">Cold-Chain Specification</span>
                          <span className="font-extrabold text-slate-800">
                            {selectedOrder.storageSpec || '2°C - 6°C Reefer'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {/* Dispatcher or vehicle assign button if not yet in transit / delivered */}
                      {!['IN_TRANSIT', 'PICKUP_VERIFIED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'].includes(selectedOrder.status) && (
                        (selectedOrder.isConsumer || selectedOrder.buyerRole === 'CONSUMER' || (selectedOrder.totalOrderKg || selectedOrder.quantityKg || 0) <= 50) ? (
                          <button
                            onClick={() => {
                              setActiveWorkspaceTab('TSP_OPTIMIZER');
                              setSearchParams({ tab: 'route-map' });
                            }}
                            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                          >
                            <Zap className="w-3.5 h-3.5 text-emerald-300" />
                            ⚡ Open AI Batch Dispatcher (All 20km Orders)
                          </button>
                        ) : (
                          <button
                            onClick={() => openVehicleAssign(selectedOrder)}
                            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all cursor-pointer"
                          >
                            Assign Dedicated Truck
                          </button>
                        )
                      )}

                      {/* Left Status Badge / Scan QR */}
                      {!['IN_TRANSIT', 'PICKUP_VERIFIED', 'PICKED_UP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'].includes(selectedOrder.status) ? (
                        <button
                          onClick={() => openQrScanner(selectedOrder, 'PICKUP')}
                          className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-bold text-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" /> Scan Gate QR
                        </button>
                      ) : ['IN_TRANSIT', 'PICKUP_VERIFIED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(selectedOrder.status) ? (
                        <span className="px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-900 border border-indigo-200 font-extrabold text-xs flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                          <span>Shipped &amp; Transmitting En Route 🛵</span>
                        </span>
                      ) : (
                        <span className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 font-extrabold text-xs flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Delivered &amp; Handed Over ✅</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {(selectedOrder.status === 'PENDING' || selectedOrder.status === 'CONFIRMED') && (
                        <button
                          onClick={() => handleUpdateStatus(selectedOrder._id, 'ACCEPTED')}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                        >
                          Accept Consignment
                        </button>
                      )}

                      {selectedOrder.status === 'ACCEPTED' && (
                        <button
                          onClick={() => {
                            if (selectedOrder.isConsumer || selectedOrder.buyerRole === 'CONSUMER') {
                              setActiveWorkspaceTab('TSP_OPTIMIZER');
                              setSearchParams({ tab: 'route-map' });
                            } else {
                              handleUpdateStatus(selectedOrder._id, 'IN_TRANSIT');
                            }
                          }}
                          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <Truck className="w-4 h-4" /> Start Transit
                        </button>
                      )}

                      {['IN_TRANSIT', 'PICKUP_VERIFIED', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(selectedOrder.status) && (
                        <button
                          onClick={() => openQrScanner(selectedOrder, 'DELIVERY')}
                          className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                        >
                          <ShieldCheck className="w-4 h-4 text-purple-200" /> Confirm Proof of Delivery (POD)
                        </button>
                      )}

                      {(selectedOrder.status === 'DELIVERED' || selectedOrder.status === 'COMPLETED') && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Settled &amp; Delivered
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: TSP MULTI-STOP ROUTE OPTIMIZER & AI MULTI-FLEET COST MINIMIZER
           ========================================================================= */}
        {activeWorkspaceTab === 'TSP_OPTIMIZER' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Route Mode Bar */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRouteMode('CONSUMER_DIRECTIONAL_SPLIT')}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                    routeMode === 'CONSUMER_DIRECTIONAL_SPLIT' || routeMode === 'CONSUMER_20KM_CLUSTER'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <GitFork className="w-4 h-4" />
                  20km Consumer Orders (AI Multi-Fleet Cost Optimizer)
                </button>

                <button
                  onClick={() => setRouteMode('BULK_DIRECT')}
                  className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                    routeMode === 'BULK_DIRECT'
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  Dedicated Bulk Freight Linehaul
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-3.5 py-1.5 rounded-2xl border border-emerald-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  {routeData?.summary?.costSavingsPercentage || 56}% Logistics Cost Saved
                </span>
              </div>
            </div>

            {/* Directional Analysis & Dynamic 1-5 Fleet Cost Engine */}
            {(routeMode === 'CONSUMER_DIRECTIONAL_SPLIT' || routeMode === 'CONSUMER_20KM_CLUSTER') && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
                {/* Real-time Order Batch Intelligence & Automated AI Fleet Assignment */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                      <Compass className="w-4 h-4" /> Real-Time Order Destination & Cost Optimization Engine
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-0.5">
                      AI Automated Delivery Fleet & Route Allocation
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      AI directly computes the compass bearings of all incoming local consumer orders, calculates multi-rider cost curves, and assigns the lowest-cost fleet automatically.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-right">
                      <span className="text-[10px] font-extrabold uppercase text-emerald-700 block">Spatial Divergence</span>
                      <span className="text-sm font-black text-slate-900 font-mono">
                        {routeData?.directionalAnalysis?.angularDivergenceDeg || 162}° Spread (North vs South)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Batch KPI Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 block">Active Order Pool</span>
                    <b className="text-lg font-black text-slate-900 font-mono mt-0.5 block">4 Doorstep Drops</b>
                    <span className="text-[10px] text-emerald-700 font-bold">35 kg Total Payload</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 block">AI Assigned Fleet</span>
                    <b className="text-lg font-black text-emerald-700 font-mono mt-0.5 block">
                      {routeData?.fleetOptimization?.optimalRidersCount || 2} Delivery Boys
                    </b>
                    <span className="text-[10px] text-slate-500 font-medium">Parallel Shuttles</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 block">Minimized Total Cost</span>
                    <b className="text-lg font-black text-slate-900 font-mono mt-0.5 block">
                      ₹{routeData?.fleetOptimization?.fleetMatrix?.find((f) => f.isOptimal)?.totalCostRs || 210}
                    </b>
                    <span className="text-[10px] text-emerald-700 font-bold">₹190 saved vs 1 Van</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 block">Delivery Margin</span>
                    <b className="text-lg font-black text-emerald-700 font-mono mt-0.5 block">
                      69.1% Net Profit
                    </b>
                    <span className="text-[10px] text-slate-500 font-medium">₹470 Net Return</span>
                  </div>
                </div>

                {/* AI Cost-Minimization Verdict Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-[#062c18] to-slate-950 text-white shadow-md space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        AI Optimal Cost Decision (Based on Incoming Order Destinations)
                      </span>
                    </div>
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-500/30">
                      {routeData?.fleetOptimization?.recommendationVerdict ||
                        DEFAULT_ROUTE_DATA.fleetOptimization.recommendationVerdict}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {routeData?.fleetOptimization?.recommendationReason ||
                      DEFAULT_ROUTE_DATA.fleetOptimization.recommendationReason}
                  </p>
                </div>

                {/* 1 to 5 Delivery Boys Full Comparison Matrix Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Scale className="w-4 h-4 text-emerald-700" />
                      Cost & Margin Comparison Across 1 to 5 Delivery Personnel Configurations
                    </h4>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      Objective: <b>min(Total Logistics Cost)</b> = Fuel + Rider Wages + Spoilage Penalty
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200">
                          <th className="p-3 font-black">Fleet Configuration</th>
                          <th className="p-3 font-black">Combined Distance</th>
                          <th className="p-3 font-black">Max Transit Time</th>
                          <th className="p-3 font-black">Fuel / Energy</th>
                          <th className="p-3 font-black">Rider Wages</th>
                          <th className="p-3 font-black">Spoilage Penalty</th>
                          <th className="p-3 font-black text-slate-900 bg-emerald-50/70">Total Logistics Cost</th>
                          <th className="p-3 font-black text-emerald-800">Net Delivery Profit</th>
                          <th className="p-3 font-black">AI Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(routeData?.fleetOptimization?.fleetMatrix || DEFAULT_ROUTE_DATA.fleetOptimization.fleetMatrix).map((stat) => {
                          const isOptimal = stat.isOptimal;
                          const isCurrentlySelected = selectedFleetSize === stat.ridersCount;

                          return (
                            <tr
                              key={stat.ridersCount}
                              onClick={() => handleFleetSizeChange(stat.ridersCount)}
                              className={`transition-colors cursor-pointer ${
                                isCurrentlySelected
                                  ? 'bg-emerald-50/90 font-bold'
                                  : isOptimal
                                  ? 'bg-emerald-50/40 hover:bg-emerald-50/60'
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2.5 h-2.5 rounded-full ${
                                    stat.ridersCount === 1 ? 'bg-amber-500' :
                                    stat.ridersCount === 2 ? 'bg-emerald-600' :
                                    stat.ridersCount === 3 ? 'bg-indigo-600' :
                                    stat.ridersCount === 4 ? 'bg-rose-600' : 'bg-cyan-600'
                                  }`} />
                                  <span className="font-bold text-slate-900">{stat.label}</span>
                                </div>
                              </td>
                              <td className="p-3 font-mono text-slate-700">{stat.combinedDistanceKm} km</td>
                              <td className="p-3 font-mono text-slate-700">{stat.maxDurationMins} mins</td>
                              <td className="p-3 font-mono text-slate-700">₹{stat.fuelEnergyCostRs}</td>
                              <td className="p-3 font-mono text-slate-700">₹{stat.deliveryBoyWagesRs}</td>
                              <td className="p-3 font-mono">
                                {stat.spoilagePenaltyRs > 0 ? (
                                  <span className="text-rose-600 font-bold">₹{stat.spoilagePenaltyRs}</span>
                                ) : (
                                  <span className="text-emerald-700 font-bold">₹0</span>
                                )}
                              </td>
                              <td className="p-3 font-mono font-black text-slate-900 bg-emerald-50/50">
                                <span className={isOptimal ? 'text-emerald-800 text-sm' : 'text-slate-800'}>
                                  ₹{stat.totalCostRs}
                                </span>
                              </td>
                              <td className="p-3 font-mono">
                                <span className="text-emerald-700 font-black">
                                  ₹{stat.netProfitRs} ({stat.profitMarginPct}%)
                                </span>
                              </td>
                              <td className="p-3">
                                {isOptimal ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white font-black text-[10px] shadow-2xs">
                                    ⭐ Lowest Cost
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    {stat.recommendationVerdict}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Assigned Active Delivery Boys Roster for Selected Fleet */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-700" />
                      Assigned Active Delivery Personnel ({selectedFleetSize} Riders Assigned)
                    </h4>
                    <span className="text-[11px] text-slate-500 font-semibold">
                      Real-time roster & assigned sector delivery drops
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(routeData?.fleetOptimization?.routes || DEFAULT_ROUTE_DATA.fleetOptimization.routes).map((route, idx) => {
                      const rider = route.rider;
                      const stops = route.waypoints.filter((w) => w.type === 'BUYER_DROP');

                      return (
                        <div
                          key={route.routeId || idx}
                          className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 relative overflow-hidden"
                          style={{ borderLeft: `5px solid ${route.color || '#059669'}` }}
                        >
                          <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className="w-2.5 h-2.5 rounded-full inline-block"
                                  style={{ backgroundColor: route.color || '#059669' }}
                                />
                                <h5 className="text-sm font-black text-slate-900">{rider?.name || `Rider ${idx + 1}`}</h5>
                              </div>
                              <span className="text-[10px] font-bold text-slate-500 block mt-0.5">
                                {rider?.roleTitle || route.zone || 'Delivery Executive'}
                              </span>
                            </div>

                            <a
                              href={`tel:${rider?.phone}`}
                              className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center gap-1 transition-colors"
                            >
                              <Phone className="w-3 h-3 text-emerald-600" />
                              {rider?.phone || 'Call'}
                            </a>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                              <span className="text-slate-400 block text-[10px]">Vehicle</span>
                              <b className="text-slate-800 font-mono">{rider?.vehicleNo || 'HR-05-EV'}</b>
                              <span className="text-[10px] text-slate-500 block truncate">{rider?.vehicleType}</span>
                            </div>

                            <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                              <span className="text-slate-400 block text-[10px]">Route Load</span>
                              <b className="text-slate-800 font-mono">{route.distanceKm} km • {route.durationMins}m</b>
                              <span className="text-[10px] text-emerald-700 font-bold block">{route.totalKg || 15} kg payload</span>
                            </div>
                          </div>

                          {/* Assigned Stops */}
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                              Assigned Drops ({stops.length} Stops):
                            </span>
                            {stops.map((stop, sIdx) => (
                              <div
                                key={sIdx}
                                className="p-2 rounded-xl bg-slate-50/80 border border-slate-100 text-[11px] space-y-0.5"
                              >
                                <div className="flex items-center justify-between">
                                  <b className="text-slate-900 truncate">{stop.name}</b>
                                  <span className="font-mono text-[10px] text-emerald-700 font-bold">
                                    {stop.distanceKm} km
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 truncate">{stop.address}</p>
                                {stop.crop && <p className="text-[10px] font-semibold text-emerald-800">{stop.crop}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* In-place Dispatch Success Banner (Visible right next to button) */}
                {isDispatched && dispatchedFleetInfo && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex flex-wrap items-center justify-between gap-2.5 shadow-2xs animate-fade-in">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping flex-shrink-0" />
                      <div>
                        <span className="text-xs font-black text-emerald-950 block">
                          ⚡ Active Batch #{dispatchedFleetInfo.batchId} Dispatched & In-Transit!
                        </span>
                        <span className="text-[11px] text-emerald-800 font-semibold">
                          {dispatchedFleetInfo.fleetCount} Delivery Riders en route • ₹{dispatchedFleetInfo.costRs} Total Cost • Zero Spoilage Loss
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDispatchModalOpen(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold text-xs shadow-xs cursor-pointer transition-colors"
                      >
                        📋 View Live Manifest & POD
                      </button>
                    </div>
                  </div>
                )}

                {/* 1-Click Dispatch Action Button */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-500 font-semibold">
                    ⭐ AI Recommendation automatically picks the lowest cost fleet ($k^*$) to eliminate transit delays and perishability loss.
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDispatchAction('OPTIMAL', selectedFleetSize)}
                      disabled={isDispatching}
                      className={`px-6 py-3 rounded-2xl font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                        isDispatching
                          ? 'bg-slate-400 text-white cursor-wait'
                          : isDispatched
                          ? 'bg-emerald-800 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/50'
                          : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                      }`}
                    >
                      {isDispatching ? (
                        <>
                          <RefreshCw className="w-4 h-4 text-emerald-200 animate-spin" />
                          <span>Dispatching & Transmitting Routes to Fleet...</span>
                        </>
                      ) : isDispatched ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                          <span>✅ Fleet In-Transit (Dispatched) — Click to View Manifest</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 text-emerald-300" />
                          <span>⚡ Dispatch AI Optimal Fleet ({selectedFleetSize} Delivery Personnel)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Leaflet GPS Route Map with Multi-Vehicle Polylines */}
            <div id="interactive-gps-map" className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-3 scroll-mt-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-black text-slate-900">
                    Interactive Multi-Rider GPS Route Map ({selectedFleetSize} Active Routes)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500 font-semibold">
                  {routeData?.summary?.totalDistanceKm} km Combined • {routeData?.summary?.totalDurationHours} hrs
                </span>
              </div>

              <LogisticsRouteMap
                routes={routeData?.fleetOptimization?.routes || DEFAULT_ROUTE_DATA.fleetOptimization.routes}
                waypoints={routeData?.route?.waypoints || DEFAULT_ROUTE_DATA.route.waypoints}
                activeVehicleLocation={{ lat: 29.6920, lng: 76.9810 }}
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: FLEET & LIVE IOT COLD-CHAIN TELEMETRY COMMAND CENTER
           ========================================================================= */}
        {activeWorkspaceTab === 'COLD_CHAIN_FLEET' && (
          <div className="space-y-6 animate-fade-in">
            {/* Top Fleet Summary Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-slate-500 text-[11px] font-bold block">Active Fleet</span>
                <p className="text-xl font-black text-slate-900 mt-1">{fleetVehicles.length} Commercial Trucks</p>
                <span className="text-[10px] text-emerald-700 font-bold">100% Telemetry Online</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-slate-500 text-[11px] font-bold block">Cold-Chain Compliance</span>
                <p className="text-xl font-black text-emerald-700 mt-1">99.4% APEDA Certified</p>
                <span className="text-[10px] text-slate-500 font-medium">Zero spoilage reported</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-slate-500 text-[11px] font-bold block">Telemetry Heartbeat</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping inline-block" />
                  <p className="text-sm font-black text-slate-900 font-mono">
                    {lastTelemetryTick.toLocaleTimeString()}
                  </p>
                </div>
                <span className="text-[10px] text-slate-400 font-medium">Ping cycle: 3.5 seconds</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
                <span className="text-slate-500 text-[11px] font-bold block">Active Reefer Alarms</span>
                <p className="text-xl font-black text-emerald-700">0 Critical Breaches</p>
                <span className="text-[10px] text-emerald-700 font-bold">All compartments in range</span>
              </div>
            </div>

            {/* Main Interactive Fleet Grid (Left: Vehicle Selector List | Right: Live Sensor Console) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 4 Cols: Fleet Vehicle Selector */}
              <div className="lg:col-span-4 space-y-3">
                <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-emerald-700" />
                      Select Vehicle ({fleetVehicles.length})
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">Click to monitor</span>
                  </div>

                  <div className="space-y-2.5">
                    {fleetVehicles.map((v) => {
                      const isSelected = selectedVehicle.vehicleNo === v.vehicleNo;
                      const isTempSafe = v.currentTempC <= 7.0;

                      return (
                        <div
                          key={v.vehicleNo}
                          onClick={() => setSelectedVehicleNo(v.vehicleNo)}
                          className={`p-3.5 rounded-2xl transition-all cursor-pointer border relative overflow-hidden ${
                            isSelected
                              ? 'bg-gradient-to-r from-emerald-50/90 to-white border-y border-r border-emerald-300 border-l-4 border-l-emerald-600 shadow-sm ring-2 ring-emerald-500/15'
                              : 'bg-slate-50/60 hover:bg-slate-100/80 border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="font-mono text-xs font-black text-slate-900 block">{v.vehicleNo}</span>
                              <span className="text-[11px] text-slate-600 font-semibold truncate block max-w-[180px]">{v.type}</span>
                            </div>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              v.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {v.status}
                            </span>
                          </div>

                          {/* Live Sensor Strip */}
                          <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold">
                            <span className={`flex items-center gap-1 ${isTempSafe ? 'text-emerald-700' : 'text-rose-600'}`}>
                              <Thermometer className="w-3.5 h-3.5" />
                              {v.currentTempC}°C
                            </span>
                            <span className="flex items-center gap-1 text-blue-600 text-[11px]">
                              <Droplets className="w-3.5 h-3.5" /> {v.humidityPercentage}%
                            </span>
                            <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                              <Activity className="w-3.5 h-3.5" /> {v.speedKmh} km/h
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right 8 Cols: Selected Vehicle Deep Telemetry Workspace */}
              <div className="lg:col-span-8 space-y-4">
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
                  {/* Vehicle Header & Current Trip */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-black text-slate-900">{selectedVehicle.vehicleNo}</span>
                        <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {selectedVehicle.status}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          GPS: {selectedVehicle.gpsCoordinates.lat.toFixed(4)}°N, {selectedVehicle.gpsCoordinates.lng.toFixed(4)}°E
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-600">{selectedVehicle.type}</p>
                      <p className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-emerald-600" />
                        Cargo: {selectedVehicle.activeConsignment}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePingSensors(selectedVehicle.vehicleNo)}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Radio className="w-3.5 h-3.5 text-emerald-600" /> Ping Sensor
                      </button>
                      <button
                        onClick={() => handleTriggerDefrost(selectedVehicle.vehicleNo)}
                        className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Flame className="w-3.5 h-3.5 text-blue-600" /> Run Defrost
                      </button>
                    </div>
                  </div>

                  {/* 4 Interactive Hero IoT Sensor Dials */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    {/* Dial 1: Temperature */}
                    <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-50/70 to-emerald-100/40 border border-emerald-200 text-center space-y-1">
                      <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider flex items-center justify-center gap-1">
                        <Thermometer className="w-3.5 h-3.5" /> Reefer Temp
                      </span>
                      <p className="text-3xl font-black text-emerald-950 font-mono">
                        {selectedVehicle.currentTempC}°C
                      </p>
                      <span className="text-[10px] font-bold text-emerald-700 bg-white/80 px-2 py-0.5 rounded-full inline-block">
                        Target: {selectedVehicle.targetTemp || 3.5}°C
                      </span>
                    </div>

                    {/* Dial 2: Humidity */}
                    <div className="p-4 rounded-2xl bg-gradient-to-b from-blue-50/70 to-blue-100/40 border border-blue-200 text-center space-y-1">
                      <span className="text-[10px] font-black uppercase text-blue-800 tracking-wider flex items-center justify-center gap-1">
                        <Droplets className="w-3.5 h-3.5" /> Humidity
                      </span>
                      <p className="text-3xl font-black text-blue-950 font-mono">
                        {selectedVehicle.humidityPercentage}%
                      </p>
                      <span className="text-[10px] font-bold text-blue-700 bg-white/80 px-2 py-0.5 rounded-full inline-block">
                        Target: 80% - 90%
                      </span>
                    </div>

                    {/* Dial 3: Speed & GPS */}
                    <div className="p-4 rounded-2xl bg-gradient-to-b from-purple-50/70 to-purple-100/40 border border-purple-200 text-center space-y-1">
                      <span className="text-[10px] font-black uppercase text-purple-800 tracking-wider flex items-center justify-center gap-1">
                        <Activity className="w-3.5 h-3.5" /> Speed
                      </span>
                      <p className="text-3xl font-black text-purple-950 font-mono">
                        {selectedVehicle.speedKmh} <span className="text-xs">km/h</span>
                      </p>
                      <span className="text-[10px] font-bold text-purple-700 bg-white/80 px-2 py-0.5 rounded-full inline-block">
                        Speed Limit: 70
                      </span>
                    </div>

                    {/* Dial 4: Battery & Reefer Power */}
                    <div className="p-4 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-200 text-center space-y-1">
                      <span className="text-[10px] font-black uppercase text-slate-700 tracking-wider flex items-center justify-center gap-1">
                        <Battery className="w-3.5 h-3.5 text-emerald-600" /> Battery
                      </span>
                      <p className="text-3xl font-black text-slate-900 font-mono">
                        {selectedVehicle.batteryPercentage || 96}%
                      </p>
                      <span className="text-[10px] font-bold text-emerald-700 bg-white/80 px-2 py-0.5 rounded-full inline-block">
                        Fuel: {selectedVehicle.fuelPercentage || 84}%
                      </span>
                    </div>
                  </div>

                  {/* Interactive Thermostat & Compressor Set-Point Controls */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                        <Sliders className="w-4 h-4 text-emerald-700" />
                        Reefer Thermostat Set-Point Adjuster
                      </span>
                      <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Status: {selectedVehicle.compressorStatus || 'ACTIVE_COOLING'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <button
                        onClick={() => handleSetTargetTemp(selectedVehicle.vehicleNo, 2.0)}
                        className={`py-2 px-3 rounded-xl font-bold transition-all cursor-pointer border ${
                          selectedVehicle.targetTemp === 2.0
                            ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        ❄️ 2.0°C (Dairy / Berries)
                      </button>

                      <button
                        onClick={() => handleSetTargetTemp(selectedVehicle.vehicleNo, 3.5)}
                        className={`py-2 px-3 rounded-xl font-bold transition-all cursor-pointer border ${
                          selectedVehicle.targetTemp === 3.5 || !selectedVehicle.targetTemp
                            ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        🥬 3.5°C (Tomato / Greens)
                      </button>

                      <button
                        onClick={() => handleSetTargetTemp(selectedVehicle.vehicleNo, 6.0)}
                        className={`py-2 px-3 rounded-xl font-bold transition-all cursor-pointer border ${
                          selectedVehicle.targetTemp === 6.0
                            ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        🥔 6.0°C (Root Crops)
                      </button>

                      <button
                        onClick={() => handleSetTargetTemp(selectedVehicle.vehicleNo, 18.0)}
                        className={`py-2 px-3 rounded-xl font-bold transition-all cursor-pointer border ${
                          selectedVehicle.targetTemp === 18.0
                            ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                            : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                        }`}
                      >
                        🌾 18°C (Ambient Grain)
                      </button>
                    </div>
                  </div>

                  {/* Driver & Load Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <span className="text-slate-400 font-bold block text-[10px]">Assigned Driver</span>
                      <p className="font-extrabold text-slate-900">{selectedVehicle.driverName}</p>
                      <a href={`tel:${selectedVehicle.driverPhone}`} className="text-emerald-700 font-bold hover:underline font-mono block">
                        📞 {selectedVehicle.driverPhone}
                      </a>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500">
                        <span>Payload Utilization:</span>
                        <span>{selectedVehicle.utilizedKg} / {selectedVehicle.capacityKg} kg</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (selectedVehicle.utilizedKg / selectedVehicle.capacityKg) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Real-time Sensor Log Stream */}
                  <div className="space-y-2.5">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-600" />
                      Live Sensor Log History ({selectedVehicle.vehicleNo})
                    </span>

                    <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 overflow-hidden">
                      {(selectedVehicle.recentLogs || INITIAL_FLEET_VEHICLES[0].recentLogs).map((log, idx) => (
                        <div key={idx} className="p-3 bg-white hover:bg-slate-50 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[11px] text-slate-400 font-semibold">{log.time}</span>
                            <span className="font-bold text-slate-800">🌡️ {log.temp}°C</span>
                            <span className="text-slate-600 font-medium">💧 {log.humidity}%</span>
                            <span className="text-slate-500">⚡ {log.speed} km/h</span>
                          </div>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                            log.status === 'NORMAL' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {log.status === 'NORMAL' ? '✅ OPTIMAL' : '⚠️ WARNING'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Live GPS Map for Selected Vehicle */}
                  <div className="space-y-2">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-emerald-600" />
                      Live GPS Tracking on Route
                    </span>
                    <LogisticsRouteMap
                      waypoints={[
                        {
                          type: 'COLLECTION_HUB',
                          name: 'Aggregation Node',
                          location: { lat: 29.6857, lng: 76.9905 },
                          address: 'Karnal FPO Terminal',
                          crop: 'Cold Transit Hub',
                        },
                        {
                          type: 'BUYER_DROP',
                          name: 'Destination Supermarket Hub',
                          location: { lat: 28.5355, lng: 77.3910 },
                          address: 'Sector 62, Noida DC',
                          crop: 'Cold Delivery Drop',
                        },
                      ]}
                      activeVehicleLocation={selectedVehicle.gpsCoordinates}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR Scanner & Batch POD Verification Modal */}
        <LogisticsQRScannerModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          selectedOrder={selectedOrderForModal}
          mode={qrModalMode}
          onSuccess={(resData) => {
            const nextStatus = qrModalMode === 'PICKUP' ? 'IN_TRANSIT' : 'DELIVERED';
            const targetId = selectedOrderForModal?._id;
            if (targetId) {
              setTasks((prev) =>
                prev.map((t) => (t._id === targetId ? { ...t, status: nextStatus } : t))
              );
              setDemoTasks((prev) =>
                prev.map((t) => (t._id === targetId ? { ...t, status: nextStatus } : t))
              );
            }
            fetchLogisticsData();
          }}
        />

        {/* Vehicle Assignment Modal */}
        <LogisticsVehicleAssignModal
          isOpen={vehicleModalOpen}
          onClose={() => setVehicleModalOpen(false)}
          selectedOrder={selectedOrderForModal}
          fleetVehicles={fleetVehicles}
          onSuccess={() => {
            fetchLogisticsData();
          }}
        />

        {/* AI Dispatch Confirmation & Live Fleet Tracking Modal */}
        <LogisticsDispatchModal
          isOpen={dispatchModalOpen}
          onClose={() => setDispatchModalOpen(false)}
          dispatchInfo={dispatchedFleetInfo}
          onViewMap={() => {
            const mapEl = document.getElementById('interactive-gps-map');
            if (mapEl) {
              mapEl.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          onViewShipments={() => {
            setActiveWorkspaceTab('SHIPMENT_DETAILS');
            setSearchParams({ tab: 'dispatches' });
          }}
        />
      </div>
    </DashboardLayout>
  );
};

export default LogisticsDashboard;
