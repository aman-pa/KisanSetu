from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from services.demand_forecast import predict_demand
from services.price_recommender import recommend_price
from services.visual_quality import estimate_visual_quality
from services.route_optimizer import optimize_logistics_route

app = FastAPI(
    title="KisanSetu AI Microservice Engine",
    description="Python FastAPI service providing ML Demand Forecasting, Dynamic Pricing, Visual Quality Analysis, and TSP Route Optimization",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "ONLINE",
        "service": "KisanSetu AI Python Microservice",
        "version": "1.0.0"
    }

@app.get("/forecast")
def get_forecast(
    commodity: str = Query(None),
    crop: str = Query(None),
    district: str = Query("Delhi NCR"),
    state: str = Query("Delhi"),
    horizon: int = Query(30)
):
    target_crop = commodity or crop or "Tomato"
    return predict_demand(crop_name=target_crop, district=district, state=state, horizon=horizon)

@app.get("/price-recommendation")
def get_price_recommendation(crop: str = Query("Tomato"), grade: str = Query("GRADE_A"), district: str = Query("Delhi NCR")):
    return recommend_price(crop, grade, district)

@app.get("/visual-quality")
def get_visual_quality(grade: str = Query("GRADE_A")):
    return estimate_visual_quality(grade)

@app.get("/optimize-route")
def get_optimized_route():
    return optimize_logistics_route()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
