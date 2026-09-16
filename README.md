# KisanSetu AI 🌾🤖
> **"Predict. Connect. Aggregate. Deliver."**

SIH 2026 Problem Statement **SIH26033**: *"Multiple intermediaries reduce farmers earnings and increase consumer prices."*
---
**KisanSetu AI** is an AI-powered digital agricultural marketplace designed to connect **farmers, Farmer Producer Organizations (FPOs) directly with consumers, bulk buyers, and logistics partners** through a unified platform.
It combines digital marketplace infrastructure with **demand forecasting, price recommendation, smart supply-demand matching, visual crop quality assessment, batch traceability, and logistics route optimization**.


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

### Core Concept

```text
                    👨‍🌾 FARMERS
                         │
                         ▼
                    🏢 FPOs
                 Supply Aggregation
                         │
            ┌────────────┴────────────┐
            │                         │
            ▼                         ▼
       🛒 CONSUMERS              📦 BULK BUYERS
       Local Orders             Large Procurement
            │                         │
            └────────────┬────────────┘
                         ▼
                🚚 LOGISTICS
                         │
                  Route Optimization
                         │
                         ▼
                    DELIVERY


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

---

## 🔍 AI Visual Crop Quality Assessment Architecture

KisanSetu incorporates an automated, two-stage AI-powered visual crop inspection and degradation forecasting system.

### Stage 1: Mandatory Image Quality Validation Gate
Before running crop quality analysis, the system inspects both farm-gate photographs to ensure photographic clarity:
- **Resolution**: Checks pixel dimensions (minimum 300x300 px, recommended 800px+).
- **Illumination & Exposure**: Detects underexposed (mean brightness < 35) or overexposed/washed out images (> 230).
- **Contrast & Dynamic Range**: Checks grayscale standard deviation variance.
- **Focus & Sharpness**: Computes edge gradient variance (Laplacian approximation).
- **Rejection Gate**: Any image scoring below **70/100** is rejected with human-friendly guidance (e.g., *"The image is too dark to assess the crop. Please upload a photo with better lighting"*), strictly preventing crop quality analysis until a clearer photo is provided.
```text
Farmer uploads 2 images
          │
          ▼
┌──────────────────────────┐
│   IMAGE QUALITY GATE     │
│                          │
│ Resolution               │
│ Lighting                 │
│ Exposure                 │
│ Contrast                 │
│ Sharpness                │
└────────────┬─────────────┘
             │
       ┌─────┴─────┐
       │           │
     Reject       Pass
       │           │
       ▼           ▼
Upload Guidance   AI Analysis
```
### Stage 2: AI Visual Crop Quality Assessment
Once both uploaded photos pass Stage 1, the system conducts a visual quality assessment:
- **Vision AI Provider**: Google Gemini Vision API (`gemini-3.8-flash`), with automated fallback to a resilient botanical heuristic computer-vision engine if the API key is not configured or during offline execution.
- **Visual Attributes Evaluated**:
  - `overallScore` (0–100%)
  - `grade` (`A+`, `A`, `B`, `C`, `D`)
  - `freshness`, `appearance`, `colorQuality`, `visibleDamage` (surface integrity), `spoilageRisk`, `maturity`, `confidence`
  - `observations`: Detailed visual inspection findings
  - `concerns`: Potential storage or handling risks
- **Estimated Visual Quality Trend**: 14-day degradation forecast calibrated by storage method (`Room Temperature`, `Refrigerated`, `Cold Storage`, `Warehouse`, `Open Field`).
                              

### Image Quality Score vs. Crop Quality Score
- **Image Quality Score (Stage 1)**: Measures photographic clarity (focus, lighting, resolution, blur). Answers: *"Is this photo sharp and well-lit enough to assess?"*
- **Crop Quality Score (Stage 2)**: Measures botanical surface attributes of the produce (color, freshness, surface defects, maturity). Answers: *"What is the physical condition and grade of this crop?"*
```text
                 TWO CROP IMAGES
                        │
                        ▼
             ┌────────────────────┐
             │ Image Quality Gate │
             └─────────┬──────────┘
                       │
                 Pass / Reject
                       │
                       ▼
                Vision Analysis
                       │
              ┌────────┴────────┐
              │                 │
              ▼                 ▼
       Gemini Vision       Local Fallback
              │                 │
              └────────┬────────┘
                       ▼
             Crop Quality Result
                       │
                       ▼
             14-Day Trend Estimate
```
### Environment Configuration
To enable the Google Gemini Vision API integration:
1. Obtain an API key from [Google AI Studio](https://aistudio.google.com/).
2. Add your key to `backend/.env` (and optionally `ai-service/.env`):
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
3. If `GEMINI_API_KEY` is not set or set to `your_gemini_api_key_here`, the system automatically runs the built-in resilient botanical heuristic engine without failing or interrupting listings.

### AI Disclaimers & Scope of Assessment
- AI visual assessment is based strictly on visual analysis of uploaded photos and provides an informational estimate.
- It does **NOT** measure chemical composition, pesticide residue, or internal nutritional content.
- Estimated degradation trends depend on actual temperature, humidity, storage facility, packaging, and transit handling.

