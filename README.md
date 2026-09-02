# KisanSetu AI 🌾🤖
> **"Predict. Connect. Aggregate. Deliver."**

SIH 2026 Problem Statement **SIH26033**: *"Multiple intermediaries reduce farmers earnings and increase consumer prices."*

KisanSetu AI is a modern, end-to-end digital agricultural marketplace that connects farmers and FPOs directly with consumers and bulk buyers. Powered by AI demand forecasting, price recommendation, smart buyer-farmer matching, multi-stage quality verification, batch QR traceability, and logistics route optimization.

---

## 🏗️ Architecture

```
SIH/
├── frontend/        # React + Vite, Lucide Icons, Leaflet Maps, Recharts, Responsive Modern CSS
├── backend/         # Node.js + Express + Mongoose (MongoDB), JWT Auth & Role-Based Access Control
├── ai-service/      # Python + FastAPI microservice (Demand Forecasting, Pricing, Visual Quality, TSP Routes)
└── README.md
```

## 👥 6 User Roles & RBAC
1. **Consumer**: Direct produce shopping with admin-configured per-order purchase limit enforcement.
2. **Farmer**: Manage listings, view AI price recommendations, inspect regional demand forecasts, track earnings.
3. **FPO**: Manage member farmers, create aggregated bulk listings, track regional crop supply.
4. **Bulk Buyer**: Submit large procurement requirements, view AI Smart Matching matrix, purchase aggregated multi-farmer lots.
5. **Logistics**: View pickup tasks, inspect Leaflet optimized route maps, record digital pickup quality verification.
6. **Admin**: Government/Platform intelligence dashboard, regional surplus & shortage heatmap, purchase limit configuration, dispute resolution.

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd backend
npm install
npm run seed     # Seeds demo users, crops, demand data, and active orders
npm start        # Starts server on http://localhost:5000
```

### 2. AI Service Setup
```bash
cd ai-service
pip install -r requirements.txt
python main.py   # Starts FastAPI on http://localhost:8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev      # Starts Vite dev server on http://localhost:5173
```

---

## 🔐 Seed Demo Credentials
- **Admin**: `admin@kisansetu.in` / `Admin@123`
- **Farmer A**: `farmer.ramesh@kisansetu.in` / `Farmer@123`
- **Farmer B**: `farmer.suresh@kisansetu.in` / `Farmer@123`
- **FPO**: `fpo.punjab@kisansetu.in` / `Fpo@123`
- **Bulk Buyer**: `buyer.freshmart@kisansetu.in` / `Buyer@123`
- **Consumer**: `consumer.anita@kisansetu.in` / `Consumer@123`
- **Logistics**: `logistics.express@kisansetu.in` / `Logistics@123`
