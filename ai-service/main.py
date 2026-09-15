from fastapi import FastAPI, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
from services.demand_forecast import predict_demand
from services.price_recommender import recommend_price
from services.visual_quality import (
    estimate_visual_quality,
    validate_image_quality,
    assess_crop_quality,
    check_crop_consistency,
    assess_single_image_quality,
)
from services.route_optimizer import optimize_logistics_route

class ImageValidationRequest(BaseModel):
    image: str

class CropAnalysisRequest(BaseModel):
    cropName: str = Field(default="Tomato")
    category: Optional[str] = Field(default="VEGETABLES")
    harvestDate: Optional[str] = Field(default=None)
    storageCondition: Optional[str] = Field(default="Room Temperature")
    image1: str
    image2: str

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

@app.post("/quality/validate-image")
def endpoint_validate_image(payload: ImageValidationRequest):
    return validate_image_quality(payload.image)

@app.post("/quality/analyze")
def endpoint_analyze_crop(payload: CropAnalysisRequest):
    return assess_crop_quality(
        crop_name=payload.cropName,
        category=payload.category or "VEGETABLES",
        harvest_date=payload.harvestDate or "",
        storage_condition=payload.storageCondition or "Room Temperature",
        image1=payload.image1,
        image2=payload.image2
    )

class CropConsistencyRequest(BaseModel):
    cropName: str = Field(default="Tomato")
    category: Optional[str] = Field(default="VEGETABLES")
    image1: str
    image2: str

class SingleCropAssessRequest(BaseModel):
    cropName: str = Field(default="Tomato")
    category: Optional[str] = Field(default="VEGETABLES")
    image: str
    storageCondition: Optional[str] = Field(default="Room Temperature")

@app.post("/quality/check-consistency")
def endpoint_check_consistency(payload: CropConsistencyRequest):
    return check_crop_consistency(
        crop_name=payload.cropName,
        category=payload.category or "VEGETABLES",
        image1=payload.image1,
        image2=payload.image2
    )

@app.post("/quality/assess-single")
def endpoint_assess_single(payload: SingleCropAssessRequest):
    return assess_single_image_quality(
        crop_name=payload.cropName,
        category=payload.category or "VEGETABLES",
        image=payload.image,
        storage_condition=payload.storageCondition or "Room Temperature"
    )

@app.get("/optimize-route")
def get_optimized_route():
    return optimize_logistics_route()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
